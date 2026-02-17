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

const dotacionFormSchema = z.object({
  employee_id: z.string().min(1, "Seleccione un empleado"),
  item_name: z.string().min(1, "Ingrese el nombre del elemento"),
  item_type: z.string().optional(),
  size: z.string().optional(),
  quantity: z.coerce.number().min(1, "Mínimo 1"),
  delivery_date: z.string().min(1, "Ingrese la fecha de entrega"),
  expiry_date: z.string().optional(),
  observations: z.string().optional(),
});

type DotacionFormValues = z.infer<typeof dotacionFormSchema>;

interface DotacionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dotacion?: Tables<"dotacion"> | null;
  defaultEmployeeId?: string;
}

export function DotacionForm({ open, onOpenChange, dotacion, defaultEmployeeId }: DotacionFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!dotacion;
  const hasDefaultEmployee = !!defaultEmployeeId;

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

  const form = useForm<DotacionFormValues>({
    resolver: zodResolver(dotacionFormSchema),
    defaultValues: {
      employee_id: "",
      item_name: "",
      item_type: "",
      size: "",
      quantity: 1,
      delivery_date: new Date().toISOString().split("T")[0],
      expiry_date: "",
      observations: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        employee_id: dotacion?.employee_id || defaultEmployeeId || "",
        item_name: dotacion?.item_name || "",
        item_type: dotacion?.item_type || "",
        size: dotacion?.size || "",
        quantity: dotacion?.quantity || 1,
        delivery_date: dotacion?.delivery_date || new Date().toISOString().split("T")[0],
        expiry_date: dotacion?.expiry_date || "",
        observations: dotacion?.observations || "",
      });
    }
  }, [dotacion, open, form, defaultEmployeeId]);

  const mutation = useMutation({
    mutationFn: async (values: DotacionFormValues) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuario no autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("user_id", userData.user.id)
        .single();

      if (!profile?.tenant_id) throw new Error("Tenant no encontrado");

      const payload = {
        employee_id: values.employee_id,
        item_name: values.item_name,
        item_type: values.item_type || null,
        size: values.size || null,
        quantity: values.quantity,
        delivery_date: values.delivery_date,
        expiry_date: values.expiry_date || null,
        observations: values.observations || null,
      };

      if (isEditing && dotacion) {
        const { error } = await supabase
          .from("dotacion")
          .update(payload)
          .eq("id", dotacion.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("dotacion").insert({
          ...payload,
          tenant_id: profile.tenant_id,
          created_by: userData.user.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dotacion"] });
      queryClient.invalidateQueries({ queryKey: ["dotacion-stats"] });
      queryClient.invalidateQueries({ queryKey: ["employee-dotacion"] });
      toast.success(
        isEditing ? "Dotación actualizada correctamente" : "Entrega registrada correctamente"
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
            {isEditing ? "Editar Dotación" : "Registrar Entrega de Dotación"}
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEditing || hasDefaultEmployee}>
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
              name="item_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Elemento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Uniforme completo, Botas de seguridad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="item_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="uniforme">Uniforme</SelectItem>
                        <SelectItem value="epp">EPP</SelectItem>
                        <SelectItem value="herramienta">Herramienta</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Talla</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: M, 42" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="delivery_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Entrega</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observaciones adicionales..." rows={2} {...field} />
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
                {isEditing ? "Guardar Cambios" : "Registrar Entrega"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
