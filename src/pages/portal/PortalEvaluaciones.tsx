import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { portalSupabase } from '@/integrations/supabase/portalClient';
import { useEmployeePortalAuth } from '@/hooks/useEmployeePortalAuth';
import { EmployeePortalLayout } from '@/components/portal/EmployeePortalLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function PortalEvaluaciones() {
  const { employee } = useEmployeePortalAuth();
  const eid = employee?.id;
  const [openId, setOpenId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['portal-evaluaciones', eid],
    enabled: !!eid,
    queryFn: async () => {
      const { data } = await portalSupabase
        .from('evaluations')
        .select('id, period, evaluation_date, overall_score, status, evaluator_id, employee_id, template_id, evaluation_templates(name, scale_min, scale_max)')
        .or(`employee_id.eq.${eid},evaluator_id.eq.${eid}`)
        .order('evaluation_date', { ascending: false, nullsFirst: false });
      return data || [];
    },
  });

  return (
    <EmployeePortalLayout>
      <h1 className="text-2xl font-bold">Mis evaluaciones</h1>
      {isLoading ? <p className="text-muted-foreground">Cargando...</p> : data.length === 0 ? (
        <Card className="p-6 text-muted-foreground">No tienes evaluaciones asignadas.</Card>
      ) : (
        <div className="space-y-3">
          {data.map((ev: any) => {
            const iAmEvaluator = ev.evaluator_id === eid;
            const canRespond = iAmEvaluator && ev.status !== 'completada';
            return (
              <Card key={ev.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{ev.evaluation_templates?.name || 'Evaluación'}</p>
                    <p className="text-sm text-muted-foreground">
                      Período: {ev.period || '—'} · {ev.evaluation_date ?? 's/f'}
                    </p>
                    <p className="text-sm">{iAmEvaluator ? 'Eres el evaluador' : 'Te evalúan'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={ev.status === 'completada' ? 'default' : 'secondary'}>{ev.status}</Badge>
                    {ev.overall_score != null && <p className="text-sm">Puntaje: <span className="font-medium">{ev.overall_score}</span></p>}
                    <Button size="sm" variant={canRespond ? 'default' : 'outline'} onClick={() => setOpenId(ev.id)}>
                      {canRespond ? 'Responder' : 'Ver'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {openId && (
        <EvaluacionDialog
          evaluationId={openId}
          onClose={() => { setOpenId(null); qc.invalidateQueries({ queryKey: ['portal-evaluaciones', eid] }); }}
        />
      )}
    </EmployeePortalLayout>
  );
}

function EvaluacionDialog({ evaluationId, onClose }: { evaluationId: string; onClose: () => void }) {
  const { employee } = useEmployeePortalAuth();
  const [responses, setResponses] = useState<Record<string, { score?: number; response_value?: string; comments?: string }>>({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['portal-evaluacion-detail', evaluationId],
    queryFn: async () => {
      const { data: ev } = await portalSupabase.from('evaluations')
        .select('id, template_id, evaluator_id, status, comments, evaluation_templates(name, scale_min, scale_max)')
        .eq('id', evaluationId).maybeSingle();
      const { data: sections } = await portalSupabase.from('evaluation_template_sections')
        .select('id, title, sort_order, weight').eq('template_id', ev!.template_id).order('sort_order');
      const { data: criteria } = await portalSupabase.from('evaluation_template_criteria')
        .select('id, section_id, title, description, response_type, options, sort_order')
        .in('section_id', (sections || []).map((s: any) => s.id)).order('sort_order');
      const { data: existing } = await portalSupabase.from('evaluation_responses')
        .select('criterion_id, score, response_value, comments').eq('evaluation_id', evaluationId);
      const init: any = {};
      (existing || []).forEach((r: any) => { init[r.criterion_id] = { score: r.score, response_value: r.response_value, comments: r.comments }; });
      setResponses(init);
      return { ev, sections: sections || [], criteria: criteria || [] };
    },
  });

  const canEdit = data?.ev?.evaluator_id === employee?.id && data?.ev?.status !== 'completada';
  const scaleMin = data?.ev?.evaluation_templates?.scale_min ?? 1;
  const scaleMax = data?.ev?.evaluation_templates?.scale_max ?? 5;

  const setR = (cid: string, patch: any) => setResponses((p) => ({ ...p, [cid]: { ...p[cid], ...patch } }));

  const submit = async (finalize: boolean) => {
    if (!canEdit) return;
    setSaving(true);
    try {
      const rows = Object.entries(responses).map(([cid, r]) => ({
        evaluation_id: evaluationId, criterion_id: cid,
        score: r.score ?? null, response_value: r.response_value ?? null, comments: r.comments ?? null,
      }));
      for (const row of rows) {
        const { error } = await portalSupabase.from('evaluation_responses').upsert(row, { onConflict: 'evaluation_id,criterion_id' } as any);
        if (error) throw error;
      }
      if (finalize) {
        await portalSupabase.from('evaluations').update({ status: 'completada', evaluation_date: new Date().toISOString().slice(0, 10) }).eq('id', evaluationId);
      }
      toast.success(finalize ? 'Evaluación enviada' : 'Borrador guardado');
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{data?.ev?.evaluation_templates?.name || 'Evaluación'}</DialogTitle></DialogHeader>
        {isLoading ? <p>Cargando...</p> : (
          <div className="space-y-6">
            {data!.sections.map((s: any) => (
              <div key={s.id} className="space-y-3">
                <h3 className="font-semibold border-b pb-1">{s.title}</h3>
                {data!.criteria.filter((c: any) => c.section_id === s.id).map((c: any) => {
                  const r = responses[c.id] || {};
                  return (
                    <div key={c.id} className="space-y-2 p-3 rounded border bg-muted/20">
                      <p className="font-medium">{c.title}</p>
                      {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
                      {c.response_type === 'scale' && (
                        <div>
                          <Label className="text-sm">Puntaje ({scaleMin}–{scaleMax})</Label>
                          <Input type="number" min={scaleMin} max={scaleMax} disabled={!canEdit}
                            value={r.score ?? ''} onChange={(e) => setR(c.id, { score: e.target.value ? Number(e.target.value) : undefined })} />
                        </div>
                      )}
                      {(c.response_type === 'yes_no' || c.response_type === 'single_choice' || c.response_type === 'multiple_choice') && (
                        <div>
                          <Label className="text-sm">Respuesta</Label>
                          <Input disabled={!canEdit} value={r.response_value || ''} onChange={(e) => setR(c.id, { response_value: e.target.value })}
                            placeholder={(c.options ? JSON.stringify(c.options) : c.response_type === 'yes_no' ? 'si / no' : '')} />
                        </div>
                      )}
                      {c.response_type === 'open_text' && (
                        <Textarea disabled={!canEdit} value={r.response_value || ''} onChange={(e) => setR(c.id, { response_value: e.target.value })} />
                      )}
                      <Textarea disabled={!canEdit} placeholder="Comentarios (opcional)" value={r.comments || ''} onChange={(e) => setR(c.id, { comments: e.target.value })} />
                    </div>
                  );
                })}
              </div>
            ))}
            {canEdit ? (
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" disabled={saving} onClick={() => submit(false)}>Guardar borrador</Button>
                <Button disabled={saving} onClick={() => submit(true)}>Enviar evaluación</Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Solo lectura.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
