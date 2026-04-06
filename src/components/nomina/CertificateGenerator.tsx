import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [dirigidaA, setDirigidaA] = useState("");

  const { data: employees } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, document_type, document_number, hire_date")
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
    queryKey: ["employee-active-contract", employeeId],
    queryFn: async () => {
      const { data } = await supabase
        .from("employee_contracts")
        .select("base_salary, contract_type, start_date, position, department, payment_frequency")
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
      const { data } = await supabase.from("tenants").select("name, logo_url").eq("id", profile.tenant_id).single();
      return data;
    },
    enabled: open,
  });

  const employee = employees?.find(e => e.id === employeeId);
  const template = templates?.find(t => t.id === templateId);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  const generateContent = () => {
    if (!employee || !template) return "";
    const now = new Date();
    const salary = contract?.base_salary || 0;

    return template.content_template
      .replace(/\{\{nombre_empleado\}\}/g, `${employee.first_name} ${employee.last_name}`)
      .replace(/\{\{tipo_documento\}\}/g, employee.document_type || "CC")
      .replace(/\{\{numero_documento\}\}/g, employee.document_number || "")
      .replace(/\{\{cargo\}\}/g, contract?.position || "N/A")
      .replace(/\{\{departamento\}\}/g, contract?.department || "N/A")
      .replace(/\{\{fecha_inicio\}\}/g, contract?.start_date || employee.hire_date || "N/A")
      .replace(/\{\{tipo_contrato\}\}/g, contract?.contract_type || "N/A")
      .replace(/\{\{salario_base\}\}/g, formatCurrency(salary))
      .replace(/\{\{salario_letras\}\}/g, "")
      .replace(/\{\{empresa\}\}/g, tenant?.name || "La Empresa")
      .replace(/\{\{dirigida_a\}\}/g, dirigidaA || "A QUIEN INTERESE")
      .replace(/\{\{dia\}\}/g, now.getDate().toString())
      .replace(/\{\{mes\}\}/g, monthNames[now.getMonth()])
      .replace(/\{\{año\}\}/g, now.getFullYear().toString());
  };

  const content = generateContent();

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const logoHtml = tenant?.logo_url
      ? `<img src="${tenant.logo_url}" style="height:60px;margin:0 auto 10px;display:block;" />`
      : "";
    printWindow.document.write(`<html><head><title>Certificación</title><style>
      body { padding:40px; font-family:serif; font-size:14px; line-height:1.8; }
      p { margin: 0.3em 0; }
    </style></head><body>
      ${logoHtml}
      ${content}
    </body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar Certificación Laboral
          </DialogTitle>
          <DialogDescription>Los datos se toman del contrato activo del empleado</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <Label>Dirigida a (opcional)</Label>
            <Input
              value={dirigidaA}
              onChange={e => setDirigidaA(e.target.value)}
              placeholder="Dejar vacío para 'A QUIEN INTERESE'"
            />
          </div>

          {employeeId && contract && (
            <div className="border rounded-lg p-3 bg-muted/30 text-sm space-y-1">
              <p className="font-medium">Datos del contrato activo:</p>
              <p>Cargo: {contract.position || "—"} | Depto: {contract.department || "—"}</p>
              <p>Tipo: {contract.contract_type} | Salario: {formatCurrency(contract.base_salary)}</p>
              <p>Inicio: {contract.start_date}</p>
            </div>
          )}

          {employeeId && !contract && (
            <div className="border rounded-lg p-3 bg-destructive/10 text-sm text-destructive">
              ⚠ Este empleado no tiene un contrato activo. Los datos de la certificación estarán incompletos.
            </div>
          )}

          {content && (
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none font-serif" dangerouslySetInnerHTML={{ __html: content }} />
              </CardContent>
            </Card>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
          {content && (
            <Button className="gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
