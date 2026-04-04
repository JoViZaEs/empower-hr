import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface PayrollFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayrollForm({ open, onOpenChange }: PayrollFormProps) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [transportAllowance, setTransportAllowance] = useState("0");
  const [overtime, setOvertime] = useState("0");
  const [bonuses, setBonuses] = useState("0");
  const [commissions, setCommissions] = useState("0");
  const [otherEarnings, setOtherEarnings] = useState("0");
  const [healthDeduction, setHealthDeduction] = useState("0");
  const [pensionDeduction, setPensionDeduction] = useState("0");
  const [taxDeduction, setTaxDeduction] = useState("0");
  const [otherDeductions, setOtherDeductions] = useState("0");
  const [paymentDate, setPaymentDate] = useState("");

  const { data: employees } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, position")
        .eq("active", true)
        .order("first_name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: periods } = useQuery({
    queryKey: ["payroll-periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_periods")
        .select("*")
        .eq("status", "abierto")
        .order("start_date", { ascending: false });
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

  if (contract && !baseSalary && employeeId) {
    setBaseSalary(contract.base_salary?.toString() || "0");
  }

  // Auto-fill payment_date from selected period
  const selectedPeriod = periods?.find((p: any) => p.id === periodId);
  if (selectedPeriod?.payment_date && !paymentDate && periodId) {
    setPaymentDate(selectedPeriod.payment_date);
  }

  const earnings = [baseSalary, transportAllowance, overtime, bonuses, commissions, otherEarnings].reduce((a, b) => a + (parseFloat(b) || 0), 0);
  const deductions = [healthDeduction, pensionDeduction, taxDeduction, otherDeductions].reduce((a, b) => a + (parseFloat(b) || 0), 0);
  const netPay = earnings - deductions;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("payroll_records").insert({
        tenant_id: profile?.tenant_id!,
        employee_id: employeeId,
        period_id: periodId,
        base_salary: parseFloat(baseSalary) || 0,
        transport_allowance: parseFloat(transportAllowance) || 0,
        overtime: parseFloat(overtime) || 0,
        bonuses: parseFloat(bonuses) || 0,
        commissions: parseFloat(commissions) || 0,
        other_earnings: parseFloat(otherEarnings) || 0,
        health_deduction: parseFloat(healthDeduction) || 0,
        pension_deduction: parseFloat(pensionDeduction) || 0,
        tax_deduction: parseFloat(taxDeduction) || 0,
        other_deductions: parseFloat(otherDeductions) || 0,
        payment_date: paymentDate || null,
        status: "borrador",
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Registro de nómina creado");
      queryClient.invalidateQueries({ queryKey: ["payroll-records"] });
      onOpenChange(false);
    },
    onError: (err: any) => toast.error("Error: " + err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Registro de Nómina</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Empleado *</Label>
            <Select value={employeeId} onValueChange={(v) => { setEmployeeId(v); setBaseSalary(""); }}>
              <SelectTrigger><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
              <SelectContent>
                {employees?.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Período de Pago *</Label>
              <Select value={periodId} onValueChange={(v) => { setPeriodId(v); setPaymentDate(""); }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar período" /></SelectTrigger>
                <SelectContent>
                  {periods?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha de Pago</Label>
              <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
            </div>
          </div>

          <Separator />
          <p className="text-sm font-medium text-foreground">Devengados</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Salario Base</Label>
              <Input type="number" value={baseSalary} onChange={e => setBaseSalary(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Auxilio Transporte</Label>
              <Input type="number" value={transportAllowance} onChange={e => setTransportAllowance(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Horas Extra</Label>
              <Input type="number" value={overtime} onChange={e => setOvertime(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bonificaciones</Label>
              <Input type="number" value={bonuses} onChange={e => setBonuses(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Comisiones</Label>
              <Input type="number" value={commissions} onChange={e => setCommissions(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Otros Devengados</Label>
              <Input type="number" value={otherEarnings} onChange={e => setOtherEarnings(e.target.value)} />
            </div>
          </div>

          <Separator />
          <p className="text-sm font-medium text-foreground">Deducciones</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Salud</Label>
              <Input type="number" value={healthDeduction} onChange={e => setHealthDeduction(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Pensión</Label>
              <Input type="number" value={pensionDeduction} onChange={e => setPensionDeduction(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Retención en la Fuente</Label>
              <Input type="number" value={taxDeduction} onChange={e => setTaxDeduction(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Otras Deducciones</Label>
              <Input type="number" value={otherDeductions} onChange={e => setOtherDeductions(e.target.value)} />
            </div>
          </div>

          <Separator />
          <div className="flex justify-between items-center text-sm">
            <span>Total Devengado:</span>
            <span className="font-bold text-success">{formatCurrency(earnings)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Total Deducciones:</span>
            <span className="font-bold text-destructive">{formatCurrency(deductions)}</span>
          </div>
          <div className="flex justify-between items-center text-base border-t pt-2">
            <span className="font-bold">Neto a Pagar:</span>
            <span className="font-bold text-primary text-lg">{formatCurrency(netPay)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!employeeId || !periodId || !baseSalary || mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
