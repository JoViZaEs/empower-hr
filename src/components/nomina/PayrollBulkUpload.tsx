import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, Download, FileSpreadsheet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import * as XLSX from "xlsx";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayrollBulkUpload({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [periodId, setPeriodId] = useState("");
  const [preview, setPreview] = useState<any[]>([]);

  const { data: employees } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("id, first_name, last_name, document_number").eq("active", true);
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

  const selectedPeriod = periods?.find((p: any) => p.id === periodId);

  const downloadTemplate = () => {
    const headers = ["documento_empleado", "salario_base", "auxilio_transporte", "horas_extra", "bonificaciones", "comisiones", "otros_devengados", "deduccion_salud", "deduccion_pension", "retencion_fuente", "otras_deducciones", "fecha_pago", "notas"];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ["12345678", "1300000", "162000", "0", "0", "0", "0", "52000", "52000", "0", "0", selectedPeriod?.payment_date || "2026-04-30", ""]]);
    XLSX.utils.book_append_sheet(wb, ws, "Nómina");
    XLSX.writeFile(wb, `plantilla_nomina_${selectedPeriod?.name || "periodo"}.xlsx`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      setPreview(data.slice(0, 5));
    };
    reader.readAsBinaryString(f);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file || !employees || !periodId) throw new Error("Sin archivo, período o empleados");

      const reader = new FileReader();
      const data: any[] = await new Promise((resolve) => {
        reader.onload = (evt) => {
          const wb = XLSX.read(evt.target?.result, { type: "binary" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          resolve(XLSX.utils.sheet_to_json(ws));
        };
        reader.readAsBinaryString(file);
      });

      const empMap = new Map(employees.map(e => [e.document_number, e.id]));
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const records = data.map((row: any) => {
        const empId = empMap.get(String(row.documento_empleado));
        if (!empId) throw new Error(`Empleado no encontrado: ${row.documento_empleado}`);
        return {
          tenant_id: profile?.tenant_id!,
          employee_id: empId,
          period_id: periodId,
          base_salary: parseFloat(row.salario_base) || 0,
          transport_allowance: parseFloat(row.auxilio_transporte) || 0,
          overtime: parseFloat(row.horas_extra) || 0,
          bonuses: parseFloat(row.bonificaciones) || 0,
          commissions: parseFloat(row.comisiones) || 0,
          other_earnings: parseFloat(row.otros_devengados) || 0,
          health_deduction: parseFloat(row.deduccion_salud) || 0,
          pension_deduction: parseFloat(row.deduccion_pension) || 0,
          tax_deduction: parseFloat(row.retencion_fuente) || 0,
          other_deductions: parseFloat(row.otras_deducciones) || 0,
          payment_date: row.fecha_pago || null,
          notes: row.notas || null,
          status: "borrador",
          created_by: userId,
        };
      });

      const { error } = await supabase.from("payroll_records").insert(records);
      if (error) throw error;
      return records.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} registros de nómina cargados`);
      queryClient.invalidateQueries({ queryKey: ["payroll-records"] });
      setFile(null);
      setPreview([]);
      onOpenChange(false);
    },
    onError: (err: any) => toast.error("Error: " + err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Nómina</DialogTitle>
          <DialogDescription>Sube un archivo Excel con los datos de nómina del período</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Período de Pago *</Label>
            <Select value={periodId} onValueChange={setPeriodId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar período" /></SelectTrigger>
              <SelectContent>
                {periods?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="gap-2 w-full" onClick={downloadTemplate} disabled={!periodId}>
            <Download className="h-4 w-4" />
            Descargar Plantilla Excel
          </Button>

          <div className="space-y-2">
            <Label>Archivo Excel</Label>
            <Input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
          </div>

          {preview.length > 0 && (
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Vista previa ({preview.length} filas)
              </p>
              <div className="text-xs overflow-x-auto">
                {preview.map((row, i) => (
                  <div key={i} className="flex gap-2 py-1 border-b last:border-0">
                    <span className="font-medium">{row.documento_empleado}</span>
                    <span>Base: ${row.salario_base}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={!file || !periodId || mutation.isPending} className="gap-2">
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Cargar Nómina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
