import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegulationForm({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [title, setTitle] = useState("Reglamento Interno de Trabajo");
  const [version, setVersion] = useState("1.0");
  const [contentType, setContentType] = useState("text");
  const [contentText, setContentText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("borrador");
  const [requiresSignature, setRequiresSignature] = useState(true);

  const mutation = useMutation({
    mutationFn: async () => {
      let documentUrl: string | null = null;

      if (contentType === "pdf" && pdfFile) {
        const fileName = `${profile?.tenant_id}/${Date.now()}_${pdfFile.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("regulations")
          .upload(fileName, pdfFile);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("regulations").getPublicUrl(fileName);
        documentUrl = urlData.publicUrl;
      }

      const userId = (await supabase.auth.getUser()).data.user?.id;

      const { data: reg, error } = await supabase.from("regulations").insert({
        tenant_id: profile?.tenant_id!,
        title,
        version,
        content_type: contentType,
        content_text: contentType === "text" ? contentText : null,
        document_url: documentUrl,
        effective_date: effectiveDate,
        status,
        requires_signature: requiresSignature,
        published_at: status === "publicado" ? new Date().toISOString() : null,
        published_by: status === "publicado" ? userId : null,
        created_by: userId,
      }).select("id").single();
      if (error) throw error;

      // If published, create pending acknowledgments for all active employees
      if (status === "publicado") {
        const { data: employees } = await supabase
          .from("employees")
          .select("id")
          .eq("active", true)
          .eq("tenant_id", profile?.tenant_id!);

        if (employees?.length) {
          const acks = employees.map(emp => ({
            tenant_id: profile?.tenant_id!,
            regulation_id: reg.id,
            employee_id: emp.id,
            status: "pendiente",
          }));
          await supabase.from("regulation_acknowledgments").insert(acks);
        }
      }
    },
    onSuccess: () => {
      toast.success("Reglamento creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["regulations"] });
      queryClient.invalidateQueries({ queryKey: ["regulation-acknowledgments"] });
      onOpenChange(false);
    },
    onError: (err: any) => toast.error("Error: " + err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Versión del Reglamento</DialogTitle>
          <DialogDescription>Crea una nueva versión del reglamento interno de trabajo</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Versión *</Label>
              <Input value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Vigencia *</Label>
              <Input type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Contenido</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto Enriquecido</SelectItem>
                <SelectItem value="pdf">Documento PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {contentType === "text" ? (
            <div className="space-y-2">
              <Label>Contenido del Reglamento</Label>
              <Textarea
                value={contentText}
                onChange={e => setContentText(e.target.value)}
                rows={12}
                placeholder="Escriba o pegue el contenido del reglamento aquí..."
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Archivo PDF</Label>
              <Input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch checked={requiresSignature} onCheckedChange={setRequiresSignature} />
            <Label>Requiere firma del empleado tras la lectura</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!title || !version || mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
