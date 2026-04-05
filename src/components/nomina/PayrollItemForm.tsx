import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LineItem {
  concept: string;
  type: "DEV" | "DED";
  value: string;
  notes: string;
}

const defaultConcepts = {
  DEV: ["Salario Base", "Auxilio de Transporte", "Horas Extra", "Bonificaciones", "Comisiones", "Otros Devengados"],
  DED: ["Salud", "Pensión", "Retención en la Fuente", "Fondo de Solidaridad", "Otras Deducciones"],
};

export function PayrollItemForm({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { concept: "Salario Base", type: "DEV", value: "", notes: "" },
  ]);

  const { data: employees } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("id, first_name, last_name, document_number").eq("active", true).order("first_name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: periods } = useQuery({
    queryKey: ["payroll-periods-open"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payroll_periods").select("*").eq("status", "abierto").order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: contract } = useQuery({
    queryKey: ["employee-contract", employeeId],
    queryFn: async () => {
      const { data } = await supabase.from("employee_contracts").select("base_salary").eq("employee_id", employeeId).eq("active", true).limit(1).maybeSingle();
      return data;
    },
    enabled: !!employeeId,
  });

  // Auto-fill salary when employee changes
  const handleEmployeeChange = (id: string) => {
    setEmployeeId(id);
  };

  // Auto-fill payment_date from period
  const selectedPeriod = periods?.find((p: any) => p.id === periodId);

  const handlePeriodChange = (id: string) => {
    setPeriodId(id);
    const period = periods?.find((p: any) => p.id === id);
    if (period?.payment_date) setPaymentDate(period.payment_date);
  };

  const addItem = (type: "DEV" | "DED") => {
    setItems([...items, { concept: "", type, value: "", notes: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const totalDev = items.filter(i => i.type === "DEV").reduce((a, b) => a + (parseFloat(b.value) || 0), 0);
  const totalDed = items.filter(i => i.type === "DED").reduce((a, b) => a + (parseFloat(b.value) || 0), 0);
  const netPay = totalDev - totalDed;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  const mutation = useMutation({
    mutationFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const records = items
        .filter(i => i.concept && parseFloat(i.value) > 0)
        .map(i => ({
          tenant_id: profile?.tenant_id!,
          employee_id: employeeId,
          period_id: periodId,
          concept: i.concept,
          type: i.type,
          value: parseFloat(i.value) || 0,
          payment_date: paymentDate || null,
          notes: i.notes || null,
          created_by: userId,
        }));

      if (!records.length) throw new Error("Agrega al menos un concepto con valor");

      const { error } = await supabase.from("payroll_items" as any).insert(records);
      if (error) throw error;
      return records.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} conceptos de nómina registrados`);
      queryClient.invalidateQueries({ queryKey: ["payroll-items"] });
      onOpenChange(false);
      resetForm();
    },
    onError: (err: any) => toast.error("Error: " + err.message),
  });

  const resetForm = () => {
    setEmployeeId("");
    setPeriodId("");
    setPaymentDate("");
    setItems([{ concept: "Salario Base", type: "DEV", value: "", notes: "" }]);
  };

  // Auto-fill salary base when contract loads
  if (contract && items[0]?.concept === "Salario Base" && !items[0].value && employeeId) {
    const updated = [...items];
    updated[0] = { ...updated[0], value: contract.base_salary?.toString() || "" };
    setItems(updated);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Registro de Nómina</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Empleado *</Label>
              <Select value={employeeId} onValueChange={handleEmployeeChange}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {employees?.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Período *</Label>
              <Select value={periodId} onValueChange={handlePeriodChange}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
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

          {/* Line items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Conceptos</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => addItem("DEV")} className="text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Devengo
                </Button>
                <Button variant="outline" size="sm" onClick={() => addItem("DED")} className="text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Deducción
                </Button>
              </div>
            </div>

            {items.map((item, idx) => (
              <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg border ${item.type === "DEV" ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                <Select value={item.type} onValueChange={(v) => updateItem(idx, "type", v)}>
                  <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEV">DEV</SelectItem>
                    <SelectItem value="DED">DED</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Concepto"
                  value={item.concept}
                  onChange={e => updateItem(idx, "concept", e.target.value)}
                  className="flex-1"
                  list={`concepts-${item.type}`}
                />
                <datalist id={`concepts-${item.type}`}>
                  {defaultConcepts[item.type as "DEV" | "DED"].map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <Input
                  type="number"
                  placeholder="Valor"
                  value={item.value}
                  onChange={e => updateItem(idx, "value", e.target.value)}
                  className="w-[140px]"
                />
                <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Total Devengados:</span>
              <span className="font-bold text-success">{formatCurrency(totalDev)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Deducciones:</span>
              <span className="font-bold text-destructive">{formatCurrency(totalDed)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t pt-2">
              <span>Neto a Pagar:</span>
              <span className="text-primary text-lg">{formatCurrency(netPay)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!employeeId || !periodId || mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
