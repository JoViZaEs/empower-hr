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
  employeeId: string | null;
  periodId: string | null;
}

export function PayslipItemsDialog({ open, onOpenChange, employeeId, periodId }: Props) {
  const { data: items, isLoading } = useQuery({
    queryKey: ["payslip-items", employeeId, periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_items" as any)
        .select("*")
        .eq("employee_id", employeeId!)
        .eq("period_id", periodId!)
        .order("type")
        .order("created_at");
      if (error) throw error;
      return data as any[];
    },
    enabled: open && !!employeeId && !!periodId,
  });

  const { data: employee } = useQuery({
    queryKey: ["employee-detail", employeeId],
    queryFn: async () => {
      const { data } = await supabase.from("employees").select("first_name, last_name, document_number, document_type, position, department").eq("id", employeeId!).single();
      return data;
    },
    enabled: open && !!employeeId,
  });

  const { data: period } = useQuery({
    queryKey: ["period-detail", periodId],
    queryFn: async () => {
      const { data } = await supabase.from("payroll_periods").select("name, start_date, end_date, frequency").eq("id", periodId!).single();
      return data;
    },
    enabled: open && !!periodId,
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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val || 0);

  if (isLoading || !items) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></DialogContent>
      </Dialog>
    );
  }

  const devItems = items.filter((i: any) => i.type === "DEV");
  const dedItems = items.filter((i: any) => i.type === "DED");
  const totalDev = devItems.reduce((a: number, b: any) => a + (b.value || 0), 0);
  const totalDed = dedItems.reduce((a: number, b: any) => a + (b.value || 0), 0);
  const netPay = totalDev - totalDed;

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
              {tenant?.logo_url && (
                <img src={tenant.logo_url} alt="Logo" className="h-12 mx-auto mb-2 object-contain" />
              )}
              <h2 className="text-lg font-bold">{tenant?.name || "COMPROBANTE DE NÓMINA"}</h2>
              <p className="text-sm font-medium">COMPROBANTE DE NÓMINA</p>
              <p className="text-sm text-muted-foreground">
                Período: {period?.name || "—"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Empleado</p>
                <p className="font-medium">{employee?.first_name} {employee?.last_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Documento</p>
                <p className="font-medium">{employee?.document_type} {employee?.document_number}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cargo</p>
                <p className="font-medium">{employee?.position || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Departamento</p>
                <p className="font-medium">{employee?.department || "—"}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-bold mb-2">DEVENGADOS</p>
              {devItems.map((e: any) => (
                <div key={e.id} className="flex justify-between text-sm py-1">
                  <span>{e.concept}</span>
                  <span>{formatCurrency(e.value)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1">
                <span>Total Devengados</span>
                <span className="text-success">{formatCurrency(totalDev)}</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-bold mb-2">DEDUCCIONES</p>
              {dedItems.map((d: any) => (
                <div key={d.id} className="flex justify-between text-sm py-1">
                  <span>{d.concept}</span>
                  <span>{formatCurrency(d.value)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1">
                <span>Total Deducciones</span>
                <span className="text-destructive">{formatCurrency(totalDed)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-lg font-bold bg-primary/5 rounded-lg p-3">
              <span>NETO A PAGAR</span>
              <span className="text-primary">{formatCurrency(netPay)}</span>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
