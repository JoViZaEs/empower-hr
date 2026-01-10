import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Loader2, HeartPulse } from "lucide-react";

const vigilanciaFormSchema = z.object({
  vigilancia_type: z.string().min(1, "Seleccione el tipo de vigilancia"),
  diagnosis: z.string().min(1, "Ingrese el diagnóstico"),
  start_date: z.string().min(1, "Ingrese la fecha de inicio"),
  follow_up_date: z.string().optional(),
  restrictions: z.string().optional(),
  recommendations: z.string().optional(),
});

type VigilanciaFormValues = z.infer<typeof vigilanciaFormSchema>;

interface ExamVigilanciaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  employeeId: string;
}

const VIGILANCIA_TYPES = [
  "Osteomuscular",
  "Cardiovascular",
  "Auditivo",
  "Visual",
  "Respiratorio",
  "Psicosocial",
  "Dermatológico",
  "Neurológico",
  "Otro",
];

export function ExamVigilanciaForm({
  open,
  onOpenChange,
  examId,
  employeeId,
}: ExamVigilanciaFormProps) {
  const queryClient = useQueryClient();

  // Fetch exam data to pre-fill some fields
  const { data: exam } = useQuery({
    queryKey: ["exam-detail", examId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("*, employees(first_name, last_name)")
        .eq("id", examId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: open && !!examId,
  });

  const form = useForm<VigilanciaFormValues>({
    resolver: zodResolver(vigilanciaFormSchema),
    defaultValues: {
      vigilancia_type: "",
      diagnosis: "",
      start_date: new Date().toISOString().split("T")[0],
      follow_up_date: "",
      restrictions: "",
      recommendations: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: VigilanciaFormValues) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuario no autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("user_id", userData.user.id)
        .single();

      if (!profile?.tenant_id) throw new Error("Tenant no encontrado");

      const { error } = await supabase.from("vigilancias").insert({
        employee_id: employeeId,
        tenant_id: profile.tenant_id,
        vigilancia_type: values.vigilancia_type,
        diagnosis: values.diagnosis,
        start_date: values.start_date,
        follow_up_date: values.follow_up_date || null,
        restrictions: values.restrictions || null,
        recommendations: values.recommendations || null,
        status: "activa",
        created_by: userData.user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vigilancias"] });
      queryClient.invalidateQueries({ queryKey: ["employee-vigilancias"] });
      toast.success("Vigilancia epidemiológica creada correctamente");
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Error al crear la vigilancia: " + error.message);
    },
  });

  const onSubmit = (values: VigilanciaFormValues) => {
    mutation.mutate(values);
  };

  const employeeName = exam?.employees
    ? `${(exam.employees as any).first_name} ${(exam.employees as any).last_name}`
    : "Cargando...";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            Crear Vigilancia Epidemiológica
          </DialogTitle>
          <DialogDescription>
            Crear seguimiento para <strong>{employeeName}</strong> basado en el
            resultado del examen médico.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="vigilancia_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Vigilancia</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VIGILANCIA_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Lumbalgia crónica, hipoacusia..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Inicio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="follow_up_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Próximo Seguimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="restrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restricciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: No levantar más de 10kg, evitar posturas prolongadas..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recommendations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recomendaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Pausas activas cada 2 horas, uso de ayudas mecánicas..."
                      rows={2}
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
                disabled={mutation.isPending}
                className="gradient-primary"
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Crear Vigilancia
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
