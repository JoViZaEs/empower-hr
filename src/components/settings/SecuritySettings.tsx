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
import { useRolesPermissions } from "@/hooks/useRolesPermissions";

export function SecuritySettings() {
  const {
    isDialogOpen,
    setIsDialogOpen,
    isUserRolesDialogOpen,
    selectedRole,
    selectedUser,
    activeTab,
    setActiveTab,
    roles,
    rolesLoading,
    modules,
    permissions,
    rolePermissions,
    userPermissions,
    users,
    usersLoading,
    isCreating,
    isUpdating,
    isUpdatingUserRoles,
    handleCreateRole,
    handleUpdateRole,
    handleEditRole,
    handleDeleteRole,
    handleTogglePermission,
    handleToggleUserPermission,
    handleCloseDialog,
    handleManageUserRoles,
    handleUpdateUserRoles,
    handleCloseUserRolesDialog,
  } = useRolesPermissions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Roles y Permisos</h3>
          <p className="text-sm text-muted-foreground">
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
            isLoading={isCreating || isUpdating}
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
              isLoading={isUpdatingUserRoles}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
