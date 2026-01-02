import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { RolesList } from "@/components/roles/RolesList";
import { RoleForm } from "@/components/roles/RoleForm";
import { PermissionsMatrix } from "@/components/roles/PermissionsMatrix";
import { UserRolesList } from "@/components/roles/UserRolesList";
import { UserRolesForm } from "@/components/roles/UserRolesForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Shield, Users2, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

type Role = Tables<"roles">;
type Profile = Tables<"profiles">;

interface UserWithRoles extends Profile {
  user_roles: {
    role_id: string;
    roles: Role;
  }[];
}

export default function RolesPermisos() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUserRolesDialogOpen, setIsUserRolesDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [activeTab, setActiveTab] = useState("roles");
  const queryClient = useQueryClient();
  const { profile } = useAuth();

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

  const { data: userPermissions = [] } = useQuery({
    queryKey: ["user_permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_permissions")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["tenant_users"],
    queryFn: async () => {
      // First get all profiles in the tenant
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("first_name");
      
      if (profilesError) throw profilesError;

      // Then get all user_roles with their roles
      const { data: userRolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select(`
          user_id,
          role_id,
          roles (*)
        `);
      
      if (rolesError) throw rolesError;

      // Combine the data
      const usersWithRoles = profiles.map((profile) => ({
        ...profile,
        user_roles: userRolesData
          ?.filter((ur) => ur.user_id === profile.user_id)
          .map((ur) => ({ role_id: ur.role_id, roles: ur.roles as Role })) || [],
      }));

      return usersWithRoles as UserWithRoles[];
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: async (roleData: { name: string; description: string }) => {
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

  const updateUserRolesMutation = useMutation({
    mutationFn: async ({ userId, roleIds }: { userId: string; roleIds: string[] }) => {
      // First, delete all existing user roles
      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      
      if (deleteError) throw deleteError;

      // Then, insert new roles if any
      if (roleIds.length > 0) {
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert(roleIds.map((roleId) => ({ user_id: userId, role_id: roleId })));
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant_users"] });
      toast.success("Roles de usuario actualizados");
      setIsUserRolesDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error("Error al actualizar roles: " + error.message);
    },
  });

  const toggleUserPermissionMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      permissionId, 
      currentState 
    }: { 
      userId: string; 
      permissionId: string; 
      currentState: "granted" | "revoked" | "inherited" | "none";
    }) => {
      // Logic for state transitions:
      // none -> granted (add user_permission with granted=true)
      // inherited -> revoked (add user_permission with granted=false)
      // granted -> none (remove user_permission)
      // revoked -> inherited (remove user_permission)
      
      if (currentState === "none") {
        // Add permission
        const { error } = await supabase
          .from("user_permissions")
          .insert({ user_id: userId, permission_id: permissionId, granted: true });
        if (error) throw error;
      } else if (currentState === "inherited") {
        // Revoke permission
        const { error } = await supabase
          .from("user_permissions")
          .insert({ user_id: userId, permission_id: permissionId, granted: false });
        if (error) throw error;
      } else if (currentState === "granted" || currentState === "revoked") {
        // Remove individual permission
        const { error } = await supabase
          .from("user_permissions")
          .delete()
          .eq("user_id", userId)
          .eq("permission_id", permissionId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_permissions"] });
      toast.success("Permiso de usuario actualizado");
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

  const handleToggleUserPermission = (
    userId: string, 
    permissionId: string, 
    currentState: "granted" | "revoked" | "inherited" | "none"
  ) => {
    toggleUserPermissionMutation.mutate({ userId, permissionId, currentState });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRole(null);
  };

  const handleManageUserRoles = (user: UserWithRoles) => {
    setSelectedUser(user);
    setIsUserRolesDialogOpen(true);
  };

  const handleUpdateUserRoles = (userId: string, roleIds: string[]) => {
    updateUserRolesMutation.mutate({ userId, roleIds });
  };

  const handleCloseUserRolesDialog = () => {
    setIsUserRolesDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Roles y Permisos</h1>
            <p className="mt-1 text-muted-foreground">
              Gestiona los roles, permisos y asignaciones de usuarios
            </p>
          </div>
          {activeTab === "roles" && (
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Rol
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="roles" className="gap-2">
              <Users2 className="h-4 w-4" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <UserCog className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <Shield className="h-4 w-4" />
              Permisos
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

          <TabsContent value="users" className="space-y-4">
            <UserRolesList
              users={users}
              isLoading={usersLoading}
              onManageRoles={handleManageUserRoles}
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

        {/* Role Dialog */}
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

        {/* User Roles Dialog */}
        <Dialog open={isUserRolesDialogOpen} onOpenChange={handleCloseUserRolesDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gestionar Roles y Permisos de Usuario</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <UserRolesForm
                user={selectedUser}
                roles={roles}
                modules={modules}
                permissions={permissions}
                rolePermissions={rolePermissions}
                userPermissions={userPermissions}
                onSubmit={handleUpdateUserRoles}
                onToggleUserPermission={handleToggleUserPermission}
                onCancel={handleCloseUserRolesDialog}
                isLoading={updateUserRolesMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
