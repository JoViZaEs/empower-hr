import { useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const vigilanciaFormSchema = z.object({
  employee_id: z.string().min(1, "Seleccione un empleado"),
  vigilancia_type: z.string().min(1, "Seleccione el tipo de vigilancia"),
  diagnosis: z.string().optional(),
  start_date: z.string().min(1, "Ingrese la fecha de inicio"),
  follow_up_date: z.string().optional(),
  restrictions: z.string().optional(),
  recommendations: z.string().optional(),
});

type VigilanciaFormValues = z.infer<typeof vigilanciaFormSchema>;

interface VigilanciaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vigilancia?: Tables<"vigilancias"> | null;
}

export function VigilanciaForm({ open, onOpenChange, vigilancia }: VigilanciaFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!vigilancia;

  const { data: vigilanciaTypes } = useQuery({
    queryKey: ["vigilancia_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vigilancia_types")
        .select("*")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: employees } = useQuery({
    queryKey: ["employees-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, document_number")
        .eq("active", true)
        .order("first_name");
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<VigilanciaFormValues>({
    resolver: zodResolver(vigilanciaFormSchema),
    defaultValues: {
      employee_id: "",
      vigilancia_type: "",
      diagnosis: "",
      start_date: new Date().toISOString().split("T")[0],
      follow_up_date: "",
      restrictions: "",
      recommendations: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        employee_id: vigilancia?.employee_id || "",
        vigilancia_type: vigilancia?.vigilancia_type || "",
        diagnosis: vigilancia?.diagnosis || "",
        start_date: vigilancia?.start_date || new Date().toISOString().split("T")[0],
        follow_up_date: vigilancia?.follow_up_date || "",
        restrictions: vigilancia?.restrictions || "",
        recommendations: vigilancia?.recommendations || "",
      });
    }
  }, [vigilancia, open, form]);

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

      if (isEditing && vigilancia) {
        const { error } = await supabase
          .from("vigilancias")
          .update({
            employee_id: values.employee_id,
            vigilancia_type: values.vigilancia_type,
            diagnosis: values.diagnosis || null,
            start_date: values.start_date,
            follow_up_date: values.follow_up_date || null,
            restrictions: values.restrictions || null,
            recommendations: values.recommendations || null,
          })
          .eq("id", vigilancia.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("vigilancias").insert({
          employee_id: values.employee_id,
          tenant_id: profile.tenant_id,
          vigilancia_type: values.vigilancia_type,
          diagnosis: values.diagnosis || null,
          start_date: values.start_date,
          follow_up_date: values.follow_up_date || null,
          restrictions: values.restrictions || null,
          recommendations: values.recommendations || null,
          status: "activa",
          created_by: userData.user.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vigilancias"] });
      queryClient.invalidateQueries({ queryKey: ["employee-vigilancias"] });
      toast.success(
        isEditing
          ? "Vigilancia actualizada correctamente"
          : "Vigilancia creada correctamente"
      );
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Error al guardar: " + error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Vigilancia" : "Nueva Vigilancia Epidemiológica"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empleado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un empleado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees?.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} - {emp.document_number}
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
              name="vigilancia_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Vigilancia</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vigilanciaTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.name}
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
                    <Input placeholder="Ej: Lumbalgia crónica, hipoacusia..." {...field} />
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
                    <Textarea placeholder="Ej: No levantar más de 10kg..." rows={2} {...field} />
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
                    <Textarea placeholder="Ej: Pausas activas cada 2 horas..." rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="gradient-primary">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Guardar Cambios" : "Crear Vigilancia"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
