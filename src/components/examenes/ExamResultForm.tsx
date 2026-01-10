import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, FileText, X, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Tables } from "@/integrations/supabase/types";

const resultFormSchema = z.object({
  result: z.string().min(1, "Seleccione el resultado"),
  exam_date: z.string().min(1, "Ingrese la fecha del examen"),
  expiry_date: z.string().optional(),
  observations: z.string().optional(),
  create_vigilancia: z.boolean().optional(),
});

type ResultFormValues = z.infer<typeof resultFormSchema>;

interface ExamResultFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: Tables<"exams">;
  onVigilanciaCreate?: (examId: string, employeeId: string) => void;
}

const RESULT_OPTIONS = [
  { value: "Apto", label: "Apto", requiresVigilancia: false },
  { value: "Apto con restricciones", label: "Apto con restricciones", requiresVigilancia: true },
  { value: "Apto con recomendaciones", label: "Apto con recomendaciones", requiresVigilancia: false },
  { value: "No apto temporal", label: "No apto temporal", requiresVigilancia: true },
  { value: "No apto definitivo", label: "No apto definitivo", requiresVigilancia: true },
  { value: "Aplazado", label: "Aplazado", requiresVigilancia: false },
];

export function ExamResultForm({
  open,
  onOpenChange,
  exam,
  onVigilanciaCreate,
}: ExamResultFormProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<ResultFormValues>({
    resolver: zodResolver(resultFormSchema),
    defaultValues: {
      result: exam.result || "",
      exam_date: exam.exam_date || "",
      expiry_date: exam.expiry_date || "",
      observations: exam.observations || "",
      create_vigilancia: false,
    },
  });

  const selectedResult = form.watch("result");
  const resultOption = RESULT_OPTIONS.find((o) => o.value === selectedResult);
  const showVigilanciaOption = resultOption?.requiresVigilancia;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const mutation = useMutation({
    mutationFn: async (values: ResultFormValues) => {
      let documentUrl = exam.document_url;

      // Upload file if provided
      if (file) {
        setUploading(true);
        const fileExt = file.name.split(".").pop();
        const fileName = `${exam.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("exam-documents")
          .upload(fileName, file);

        if (uploadError) {
          setUploading(false);
          throw new Error("Error al subir el documento: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from("exam-documents")
          .getPublicUrl(fileName);

        documentUrl = urlData.publicUrl;
        setUploading(false);
      }

      const { error } = await supabase
        .from("exams")
        .update({
          result: values.result,
          exam_date: values.exam_date,
          expiry_date: values.expiry_date || null,
          observations: values.observations || null,
          document_url: documentUrl,
          status: "vigente",
        })
        .eq("id", exam.id);

      if (error) throw error;

      return values;
    },
    onSuccess: (values) => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-exam-stats"] });
      queryClient.invalidateQueries({ queryKey: ["employee-exams"] });
      toast.success("Resultado registrado correctamente");

      if (values.create_vigilancia && onVigilanciaCreate) {
        onVigilanciaCreate(exam.id, exam.employee_id);
      }

      setFile(null);
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Error al guardar el resultado: " + error.message);
    },
  });

  const onSubmit = (values: ResultFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Resultado del Examen</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="exam_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha del Examen</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="result"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resultado / Concepto</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el resultado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RESULT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showVigilanciaOption && (
              <Alert className="border-warning/20 bg-warning/5">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-sm">
                  Este resultado puede requerir seguimiento en una vigilancia
                  epidemiológica.
                  <div className="mt-2">
                    <FormField
                      control={form.control}
                      name="create_vigilancia"
                      render={({ field }) => (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="rounded border-border"
                          />
                          <span>Crear vigilancia epidemiológica</span>
                        </label>
                      )}
                    />
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="expiry_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Vencimiento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Documento / Certificado</FormLabel>
              <div
                {...getRootProps()}
                className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">
                      Arrastra o haz clic para subir
                    </span>
                    <span className="text-xs">PDF, JPG, PNG (máx 10MB)</span>
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales, restricciones, recomendaciones..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || uploading}
                className="gradient-primary"
              >
                {(mutation.isPending || uploading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Resultado
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
