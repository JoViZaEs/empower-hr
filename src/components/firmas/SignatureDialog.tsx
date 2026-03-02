import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SignatureCanvas } from "./SignatureCanvas";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: string;
  recordId: string;
  employeeId: string;
  employeeName: string;
  tenantId: string;
  onSuccess?: () => void;
}

export function SignatureDialog({
  open,
  onOpenChange,
  module,
  recordId,
  employeeId,
  employeeName,
  tenantId,
  onSuccess,
}: SignatureDialogProps) {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (dataUrl: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Convert data URL to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      // Upload to storage
      const filePath = `${tenantId}/${module}/${recordId}/${employeeId}_${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("signatures")
        .upload(filePath, blob, { contentType: "image/png" });
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("signatures")
        .getPublicUrl(filePath);

      const now = new Date();
      const watermark = `Firmado el ${format(now, "dd/MM/yyyy HH:mm:ss", { locale: es })}`;

      // Save signature record
      const { error: insertError } = await supabase
        .from("signatures" as any)
        .insert({
          tenant_id: tenantId,
          module,
          record_id: recordId,
          employee_id: employeeId,
          signed_by: user.id,
          signature_url: filePath,
          watermark_text: watermark,
          method: "canvas",
        });
      if (insertError) throw insertError;

      // Update source record based on module
      if (module === "eventos") {
        await supabase
          .from("event_participants" as any)
          .update({ signed: true, signed_at: now.toISOString(), signature_url: filePath })
          .eq("id", recordId);
      } else if (module === "dotacion") {
        await supabase
          .from("dotacion")
          .update({ signature_url: filePath })
          .eq("id", recordId);
      }
    },
    onSuccess: () => {
      toast.success("Firma registrada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["signatures"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event-participants"] });
      queryClient.invalidateQueries({ queryKey: ["dotacion-pending-signatures"] });
      queryClient.invalidateQueries({ queryKey: ["pending-signatures"] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => toast.error("Error al guardar firma: " + err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Firma Digital</DialogTitle>
          <DialogDescription>
            {employeeName} — {module === "eventos" ? "Evento" : module === "dotacion" ? "Dotación" : module}
          </DialogDescription>
        </DialogHeader>
        <SignatureCanvas
          employeeName={employeeName}
          isSaving={saveMutation.isPending}
          onSave={(dataUrl) => saveMutation.mutate(dataUrl)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
