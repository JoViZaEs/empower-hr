import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultTemplate = `{{dirigida_a}}

El suscrito Representante Legal de {{empresa}}, certifica que:

{{nombre_empleado}}, identificado(a) con {{tipo_documento}} No. {{numero_documento}}, labora en esta empresa desde el {{fecha_inicio}} con contrato a término {{tipo_contrato}}, desempeñando el cargo de {{cargo}} en el departamento de {{departamento}}.

Devenga un salario mensual de {{salario_base}} ({{salario_letras}}).

La presente certificación se expide a solicitud del interesado, a los {{dia}} días del mes de {{mes}} de {{año}}.

Atentamente,

_____________________________
Representante Legal
{{empresa}}`;

export function CertificateTemplateForm({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [name, setName] = useState("Certificación Laboral Estándar");
  const [content, setContent] = useState(defaultTemplate);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("certificate_templates").insert({
        tenant_id: profile?.tenant_id!,
        name,
        template_type: "laboral",
        content_template: content,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Plantilla creada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["certificate-templates"] });
      onOpenChange(false);
    },
    onError: (err: any) => toast.error("Error: " + err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Plantilla de Certificación</DialogTitle>
          <DialogDescription>
            Variables disponibles: {"{{dirigida_a}}"}, {"{{nombre_empleado}}"}, {"{{tipo_documento}}"}, {"{{numero_documento}}"}, {"{{cargo}}"}, {"{{departamento}}"}, {"{{fecha_inicio}}"}, {"{{tipo_contrato}}"}, {"{{salario_base}}"}, {"{{empresa}}"}, {"{{dia}}"}, {"{{mes}}"}, {"{{año}}"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nombre de la Plantilla</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Contenido de la Certificación</Label>
            <Textarea value={content} onChange={e => setContent(e.target.value)} rows={16} className="font-mono text-sm" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!name || !content || mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Guardar Plantilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
