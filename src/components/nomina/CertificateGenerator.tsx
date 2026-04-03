import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, FileText } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function CertificateGenerator({ open, onOpenChange }: Props) {
  const [employeeId, setEmployeeId] = useState("");
  const [templateId, setTemplateId] = useState("");

  const { data: employees } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, document_type, document_number, position, department, hire_date")
        .eq("active", true)
        .order("first_name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: templates } = useQuery({
    queryKey: ["certificate-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("certificate_templates").select("*").eq("active", true);
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: contract } = useQuery({
    queryKey: ["employee-contract", employeeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("employee_contracts")
        .select("base_salary")
        .eq("employee_id", employeeId)
        .eq("active", true)
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!employeeId,
  });

  const { data: tenant } = useQuery({
    queryKey: ["tenant-info"],
    queryFn: async () => {
      const { data: profile } = await supabase.from("profiles").select("tenant_id").limit(1).maybeSingle();
      if (!profile?.tenant_id) return null;
      const { data } = await supabase.from("tenants").select("name").eq("id", profile.tenant_id).single();
      return data;
    },
    enabled: open,
  });

  const employee = employees?.find(e => e.id === employeeId);
  const template = templates?.find(t => t.id === templateId);

  const generateContent = () => {
    if (!employee || !template) return "";
    const now = new Date();
    const salary = contract?.base_salary || 0;
    const formatCurrency = (val: number) =>
      new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

    return template.content_template
      .replace(/\{\{nombre_empleado\}\}/g, `${employee.first_name} ${employee.last_name}`)
      .replace(/\{\{tipo_documento\}\}/g, employee.document_type || "CC")
      .replace(/\{\{numero_documento\}\}/g, employee.document_number || "")
      .replace(/\{\{cargo\}\}/g, employee.position || "N/A")
      .replace(/\{\{departamento\}\}/g, employee.department || "N/A")
      .replace(/\{\{fecha_inicio\}\}/g, employee.hire_date || "N/A")
      .replace(/\{\{salario_base\}\}/g, formatCurrency(salary))
      .replace(/\{\{salario_letras\}\}/g, "") // Could add number-to-words library
      .replace(/\{\{empresa\}\}/g, tenant?.name || "La Empresa")
      .replace(/\{\{dia\}\}/g, now.getDate().toString())
      .replace(/\{\{mes\}\}/g, monthNames[now.getMonth()])
      .replace(/\{\{año\}\}/g, now.getFullYear().toString());
  };

  const content = generateContent();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto print:max-w-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar Certificación Laboral
          </DialogTitle>
          <DialogDescription>Selecciona el empleado y la plantilla para generar la certificación</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4 print:hidden">
            <div className="space-y-2">
              <Label>Empleado</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {employees?.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plantilla</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {templates?.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {content && (
            <Card>
              <CardContent className="pt-6">
                <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed">{content}</pre>
              </CardContent>
            </Card>
          )}
        </div>
        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
          {content && (
            <Button className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
