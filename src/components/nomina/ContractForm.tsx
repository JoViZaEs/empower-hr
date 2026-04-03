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
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ContractFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContractForm({ open, onOpenChange }: ContractFormProps) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [contractType, setContractType] = useState("indefinido");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("mensual");
  const [workHours, setWorkHours] = useState("48");
  const [observations, setObservations] = useState("");

  const { data: employees } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, position, department")
        .eq("active", true)
        .order("first_name");
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const emp = employees?.find(e => e.id === employeeId);
      const { error } = await supabase.from("employee_contracts").insert({
        tenant_id: profile?.tenant_id!,
        employee_id: employeeId,
        contract_type: contractType,
        start_date: startDate,
        end_date: endDate || null,
        base_salary: parseFloat(baseSalary),
        payment_frequency: paymentFrequency,
        work_hours_per_week: parseInt(workHours),
        position: emp?.position || null,
        department: emp?.department || null,
        observations: observations || null,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contrato registrado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["employee-contracts"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (err: any) => toast.error("Error: " + err.message),
  });

  const resetForm = () => {
    setEmployeeId("");
    setContractType("indefinido");
    setStartDate("");
    setEndDate("");
    setBaseSalary("");
    setPaymentFrequency("mensual");
    setWorkHours("48");
    setObservations("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Contrato</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Empleado *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
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
              <Label>Tipo de Contrato *</Label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="indefinido">Indefinido</SelectItem>
                  <SelectItem value="fijo">Término Fijo</SelectItem>
                  <SelectItem value="obra_labor">Obra o Labor</SelectItem>
                  <SelectItem value="prestacion_servicios">Prestación de Servicios</SelectItem>
                  <SelectItem value="aprendizaje">Aprendizaje</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frecuencia de Pago</Label>
              <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensual">Mensual</SelectItem>
                  <SelectItem value="quincenal">Quincenal</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Inicio *</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Fin</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Salario Base (COP) *</Label>
              <Input type="number" value={baseSalary} onChange={e => setBaseSalary(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Horas Semanales</Label>
              <Input type="number" value={workHours} onChange={e => setWorkHours(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observaciones</Label>
            <Textarea value={observations} onChange={e => setObservations(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!employeeId || !startDate || !baseSalary || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
