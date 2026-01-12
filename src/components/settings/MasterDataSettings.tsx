import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, FileText, Briefcase, Building2, Loader2, Activity } from "lucide-react";

type MasterDataType = "document_types" | "positions" | "departments" | "vigilancia_types";

interface MasterDataItem {
  id: string;
  name: string;
  code?: string;
  description?: string;
  active: boolean;
}

interface MasterDataFormProps {
  type: MasterDataType;
  item?: MasterDataItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function MasterDataForm({ type, item, onSuccess, onCancel }: MasterDataFormProps) {
  const [name, setName] = useState(item?.name || "");
  const [code, setCode] = useState(item?.code || "");
  const [description, setDescription] = useState(item?.description || "");
  const [active, setActive] = useState(item?.active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.tenant_id) throw new Error("Tenant no encontrado");

      const baseData = { name, active };
      const data = type === "document_types" 
        ? { ...baseData, code, tenant_id: profile.tenant_id }
        : { ...baseData, description, tenant_id: profile.tenant_id };

      if (item) {
        const { error } = await supabase
          .from(type)
          .update(data)
          .eq("id", item.id);
        if (error) throw error;
        toast.success("Registro actualizado");
      } else {
        const { error } = await supabase
          .from(type)
          .insert([data]);
        if (error) throw error;
        toast.success("Registro creado");
      }

      queryClient.invalidateQueries({ queryKey: [type] });
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === "document_types" && (
        <div className="space-y-2">
          <Label htmlFor="code">Código *</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ej: CC, CE, PA"
            maxLength={10}
            required
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={type === "document_types" ? "Ej: Cédula de Ciudadanía" : "Nombre"}
          required
        />
      </div>
      {type !== "document_types" && (
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción opcional"
          />
        </div>
      )}
      <div className="flex items-center justify-between">
        <Label htmlFor="active">Activo</Label>
        <Switch id="active" checked={active} onCheckedChange={setActive} />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {item ? "Guardar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}

interface MasterDataListProps {
  type: MasterDataType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function MasterDataList({ type, title, description, icon }: MasterDataListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: [type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(type)
        .select("*")
        .order("name");
      if (error) throw error;
      return data as MasterDataItem[];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from(type)
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [type] });
      toast.success("Estado actualizado");
    },
    onError: () => {
      toast.error("Error al actualizar estado");
    },
  });

  const handleEdit = (item: MasterDataItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setEditingItem(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Editar" : "Nuevo"} {title.slice(0, -1).toLowerCase()}
                </DialogTitle>
              </DialogHeader>
              <MasterDataForm
                type={type}
                item={editingItem}
                onSuccess={handleCloseDialog}
                onCancel={handleCloseDialog}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : items?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay registros. Agrega el primero.
          </p>
        ) : (
          <div className="space-y-2">
            {items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {type === "document_types" && item.code && (
                    <Badge variant="outline" className="font-mono">
                      {item.code}
                    </Badge>
                  )}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={item.active}
                    onCheckedChange={(checked) =>
                      toggleActive.mutate({ id: item.id, active: checked })
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MasterDataSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Datos Maestros</h2>
        <p className="text-muted-foreground">
          Configura los tipos de documento, cargos y áreas que estarán disponibles en el sistema.
        </p>
      </div>

      <Tabs defaultValue="document_types" className="space-y-4">
        <TabsList>
          <TabsTrigger value="document_types" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Tipos de Documento
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Cargos
          </TabsTrigger>
        <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Áreas
          </TabsTrigger>
          <TabsTrigger value="vigilancia_types" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Tipos de Vigilancia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="document_types">
          <MasterDataList
            type="document_types"
            title="Tipos de Documento"
            description="Define los tipos de documento de identificación válidos"
            icon={<FileText className="h-5 w-5 text-muted-foreground" />}
          />
        </TabsContent>

        <TabsContent value="positions">
          <MasterDataList
            type="positions"
            title="Cargos"
            description="Define los cargos disponibles para los empleados"
            icon={<Briefcase className="h-5 w-5 text-muted-foreground" />}
          />
        </TabsContent>

        <TabsContent value="departments">
          <MasterDataList
            type="departments"
            title="Áreas"
            description="Define las áreas o departamentos de la empresa"
            icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
          />
        </TabsContent>

        <TabsContent value="vigilancia_types">
          <MasterDataList
            type="vigilancia_types"
            title="Tipos de Vigilancia"
            description="Define los tipos de vigilancia epidemiológica disponibles"
            icon={<Activity className="h-5 w-5 text-muted-foreground" />}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
