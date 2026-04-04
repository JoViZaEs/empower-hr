import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Printer } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollId: string | null;
}

export function PayslipDialog({ open, onOpenChange, payrollId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["payslip", payrollId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_records")
        .select("*, employees!payroll_records_employee_id_fkey(first_name, last_name, document_number, document_type, position, department), payroll_periods!payroll_records_period_id_fkey(name, start_date, end_date, frequency)")
        .eq("id", payrollId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: open && !!payrollId,
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val || 0);

  if (isLoading || !data) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></DialogContent>
      </Dialog>
    );
  }

  const emp = data.employees as any;
  const period = data.payroll_periods as any;
  const earnings = [
    { label: "Salario Base", value: data.base_salary },
    { label: "Auxilio de Transporte", value: data.transport_allowance },
    { label: "Horas Extra", value: data.overtime },
    { label: "Bonificaciones", value: data.bonuses },
    { label: "Comisiones", value: data.commissions },
    { label: "Otros Devengados", value: data.other_earnings },
  ].filter(e => e.value > 0);

  const deductions = [
    { label: "Salud", value: data.health_deduction },
    { label: "Pensión", value: data.pension_deduction },
    { label: "Retención en la Fuente", value: data.tax_deduction },
    { label: "Otras Deducciones", value: data.other_deductions },
  ].filter(d => d.value > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto print:max-w-none">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Desprendible de Pago</DialogTitle>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 print:hidden">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center border-b pb-4">
              <h2 className="text-lg font-bold">COMPROBANTE DE NÓMINA</h2>
              <p className="text-sm text-muted-foreground">
                Período: {period?.name || "—"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Empleado</p>
                <p className="font-medium">{emp?.first_name} {emp?.last_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Documento</p>
                <p className="font-medium">{emp?.document_type} {emp?.document_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cargo</p>
                <p className="font-medium">{emp?.position || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Departamento</p>
                <p className="font-medium">{emp?.department || "—"}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-bold mb-2">DEVENGADOS</p>
              {earnings.map((e, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span>{e.label}</span>
                  <span>{formatCurrency(e.value)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1">
                <span>Total Devengados</span>
                <span className="text-success">{formatCurrency(data.total_earnings)}</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-bold mb-2">DEDUCCIONES</p>
              {deductions.map((d, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span>{d.label}</span>
                  <span>{formatCurrency(d.value)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1">
                <span>Total Deducciones</span>
                <span className="text-destructive">{formatCurrency(data.total_deductions)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-lg font-bold bg-primary/5 rounded-lg p-3">
              <span>NETO A PAGAR</span>
              <span className="text-primary">{formatCurrency(data.net_pay)}</span>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
