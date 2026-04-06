import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Upload, Download, FileX, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ContractRow {
  documento_empleado: string;
  tipo_contrato: string;
  fecha_inicio: string;
  fecha_fin?: string;
  salario_base: number;
  frecuencia_pago: string;
  horas_semanales?: number;
  cargo?: string;
  departamento?: string;
  observaciones?: string;
}

export function ContractBulkUpload({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [rows, setRows] = useState<ContractRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["documento_empleado", "tipo_contrato", "fecha_inicio", "fecha_fin", "salario_base", "frecuencia_pago", "horas_semanales", "cargo", "departamento", "observaciones"],
      ["1234567890", "indefinido", "2025-01-15", "", "2500000", "mensual", "48", "Analista", "TI", ""],
      ["0987654321", "fijo", "2025-02-01", "2026-01-31", "1800000", "quincenal", "48", "Asistente", "Operaciones", "Contrato a 1 año"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contratos");
    XLSX.writeFile(wb, "plantilla_contratos.xlsx");
  };

  const onDrop = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "binary" });
        const data = XLSX.utils.sheet_to_json<ContractRow>(wb.Sheets[wb.SheetNames[0]]);
        const errs: string[] = [];
        data.forEach((r, i) => {
          if (!r.documento_empleado) errs.push(`Fila ${i + 2}: documento_empleado requerido`);
          if (!r.fecha_inicio) errs.push(`Fila ${i + 2}: fecha_inicio requerida`);
          if (!r.salario_base || isNaN(Number(r.salario_base))) errs.push(`Fila ${i + 2}: salario_base inválido`);
        });
        setErrors(errs);
        setRows(data);
      } catch {
        toast.error("Error leyendo el archivo");
      }
    };
    reader.readAsBinaryString(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"], "text/csv": [".csv"] },
    maxFiles: 1,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      // Get employees by document number
      const { data: employees } = await supabase
        .from("employees")
        .select("id, document_number, position, department")
        .eq("active", true);

      const empMap = new Map(employees?.map(e => [e.document_number, e]) || []);
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const notFound: string[] = [];

      // Deactivate existing active contracts for matched employees
      const matchedEmpIds = rows
        .map(r => empMap.get(String(r.documento_empleado))?.id)
        .filter(Boolean) as string[];

      if (matchedEmpIds.length) {
        await supabase
          .from("employee_contracts")
          .update({ active: false })
          .in("employee_id", matchedEmpIds)
          .eq("active", true);
      }

      const inserts = rows.map(r => {
        const emp = empMap.get(String(r.documento_empleado));
        if (!emp) { notFound.push(String(r.documento_empleado)); return null; }
        const validTypes = ["indefinido", "fijo", "obra_labor", "prestacion_servicios", "aprendizaje"];
        const validFreqs = ["mensual", "quincenal", "semanal"];
        return {
          tenant_id: profile?.tenant_id!,
          employee_id: emp.id,
          contract_type: validTypes.includes(r.tipo_contrato) ? r.tipo_contrato : "indefinido",
          start_date: r.fecha_inicio,
          end_date: r.fecha_fin || null,
          base_salary: Number(r.salario_base),
          payment_frequency: validFreqs.includes(r.frecuencia_pago) ? r.frecuencia_pago : "mensual",
          work_hours_per_week: r.horas_semanales ? Number(r.horas_semanales) : 48,
          position: r.cargo || emp.position || null,
          department: r.departamento || emp.department || null,
          observations: r.observaciones || null,
          active: true,
          created_by: userId,
        };
      }).filter(Boolean);

      if (notFound.length) {
        toast.warning(`${notFound.length} empleado(s) no encontrados: ${notFound.slice(0, 5).join(", ")}`);
      }

      if (!inserts.length) throw new Error("No hay contratos válidos para insertar");

      const { error } = await supabase.from("employee_contracts").insert(inserts as any);
      if (error) throw error;
      return inserts.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} contratos cargados exitosamente`);
      queryClient.invalidateQueries({ queryKey: ["employee-contracts"] });
      setRows([]);
      setErrors([]);
      onOpenChange(false);
    },
    onError: (err: any) => toast.error("Error: " + err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Carga Masiva de Contratos
          </DialogTitle>
          <DialogDescription>
            Sube un archivo Excel/CSV con los datos de los contratos. Los contratos activos existentes se desactivarán y se crearán los nuevos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
            <Download className="h-4 w-4" />
            Descargar Plantilla
          </Button>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? "Suelta el archivo aquí" : "Arrastra un archivo o haz clic para seleccionar"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">.xlsx o .csv</p>
          </div>

          {rows.length > 0 && (
            <div className="border rounded-lg p-3 bg-muted/30">
              <p className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {rows.length} contratos encontrados
              </p>
              {errors.length > 0 && (
                <div className="mt-2 text-xs text-destructive space-y-1">
                  {errors.slice(0, 5).map((e, i) => <p key={i}>⚠ {e}</p>)}
                  {errors.length > 5 && <p>... y {errors.length - 5} más</p>}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!rows.length || errors.length > 0 || mutation.isPending}
            className="gap-2"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Cargar ({rows.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
