import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { RolesList } from "@/components/roles/RolesList";
import { RoleForm } from "@/components/roles/RoleForm";
import { PermissionsMatrix } from "@/components/roles/PermissionsMatrix";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Shield, Users2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Role = Tables<"roles">;

export default function RolesPermisos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState("roles");
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Role[];
    },
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("*, modules(code, name)");
      if (error) throw error;
      return data;
    },
  });

  const { data: rolePermissions = [] } = useQuery({
    queryKey: ["role_permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: async (roleData: { name: string; description: string }) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .single();
      
      if (!profile?.tenant_id) throw new Error("No tenant found");

      const { data, error } = await supabase
        .from("roles")
        .insert({
          name: roleData.name,
          description: roleData.description,
          tenant_id: profile.tenant_id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Rol creado exitosamente");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Error al crear el rol: " + error.message);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (roleData: { id: string; name: string; description: string }) => {
      const { data, error } = await supabase
        .from("roles")
        .update({
          name: roleData.name,
          description: roleData.description,
        })
        .eq("id", roleData.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Rol actualizado exitosamente");
      setIsDialogOpen(false);
      setSelectedRole(null);
    },
    onError: (error) => {
      toast.error("Error al actualizar el rol: " + error.message);
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Rol eliminado exitosamente");
    },
    onError: (error) => {
      toast.error("Error al eliminar el rol: " + error.message);
    },
  });

  const togglePermissionMutation = useMutation({
    mutationFn: async ({ roleId, permissionId, granted }: { roleId: string; permissionId: string; granted: boolean }) => {
      if (granted) {
        const { error } = await supabase
          .from("role_permissions")
          .insert({ role_id: roleId, permission_id: permissionId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("role_permissions")
          .delete()
          .eq("role_id", roleId)
          .eq("permission_id", permissionId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role_permissions"] });
      toast.success("Permiso actualizado");
    },
    onError: (error) => {
      toast.error("Error al actualizar permiso: " + error.message);
    },
  });

  const handleCreateRole = (data: { name: string; description: string }) => {
    createRoleMutation.mutate(data);
  };

  const handleUpdateRole = (data: { name: string; description: string }) => {
    if (selectedRole) {
      updateRoleMutation.mutate({ id: selectedRole.id, ...data });
    }
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm("¿Estás seguro de eliminar este rol?")) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const handleTogglePermission = (roleId: string, permissionId: string, currentlyGranted: boolean) => {
    togglePermissionMutation.mutate({ roleId, permissionId, granted: !currentlyGranted });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRole(null);
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Roles y Permisos</h1>
            <p className="mt-1 text-muted-foreground">
              Gestiona los roles y asigna permisos por módulo
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Rol
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="roles" className="gap-2">
              <Users2 className="h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <Shield className="h-4 w-4" />
              Matriz de Permisos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <RolesList
              roles={roles}
              isLoading={rolesLoading}
              onEdit={handleEditRole}
              onDelete={handleDeleteRole}
            />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionsMatrix
              roles={roles}
              modules={modules}
              permissions={permissions}
              rolePermissions={rolePermissions}
              onTogglePermission={handleTogglePermission}
            />
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedRole ? "Editar Rol" : "Crear Nuevo Rol"}
              </DialogTitle>
            </DialogHeader>
            <RoleForm
              role={selectedRole}
              onSubmit={selectedRole ? handleUpdateRole : handleCreateRole}
              onCancel={handleCloseDialog}
              isLoading={createRoleMutation.isPending || updateRoleMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
