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

export function PayrollItemsBulkUpload({ open, onOpenChange }: Props) {
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
    queryKey: ["payroll-periods-open"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payroll_periods").select("*").eq("status", "abierto").order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const selectedPeriod = periods?.find((p: any) => p.id === periodId);

  const downloadTemplate = () => {
    const headers = ["documento_empleado", "concepto", "tipo", "valor", "fecha_pago", "notas"];
    const exampleRows = [
      ["12345678", "Salario Base", "DEV", "1300000", selectedPeriod?.payment_date || "2026-04-30", ""],
      ["12345678", "Auxilio de Transporte", "DEV", "162000", selectedPeriod?.payment_date || "2026-04-30", ""],
      ["12345678", "Salud", "DED", "52000", selectedPeriod?.payment_date || "2026-04-30", ""],
      ["12345678", "Pensión", "DED", "52000", selectedPeriod?.payment_date || "2026-04-30", ""],
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...exampleRows]);
    XLSX.utils.book_append_sheet(wb, ws, "Nómina");
    XLSX.writeFile(wb, `plantilla_nomina_items_${selectedPeriod?.name || "periodo"}.xlsx`);
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
      if (!file || !employees || !periodId) throw new Error("Faltan datos");

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
        const type = String(row.tipo).toUpperCase();
        if (type !== "DEV" && type !== "DED") throw new Error(`Tipo inválido: ${row.tipo}. Usa DEV o DED`);
        return {
          tenant_id: profile?.tenant_id!,
          employee_id: empId,
          period_id: periodId,
          concept: String(row.concepto),
          type,
          value: parseFloat(row.valor) || 0,
          payment_date: row.fecha_pago || null,
          notes: row.notas || null,
          created_by: userId,
        };
      });

      const { error } = await supabase.from("payroll_items" as any).insert(records);
      if (error) throw error;
      return records.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} conceptos de nómina cargados`);
      queryClient.invalidateQueries({ queryKey: ["payroll-items"] });
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
          <DialogDescription>Sube un archivo Excel con líneas de devengo (DEV) y deducción (DED)</DialogDescription>
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
                  <div key={i} className="flex gap-3 py-1 border-b last:border-0">
                    <span className="font-medium">{row.documento_empleado}</span>
                    <span className={row.tipo === "DEV" ? "text-success" : "text-destructive"}>{row.tipo}</span>
                    <span>{row.concepto}</span>
                    <span>${row.valor}</span>
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
