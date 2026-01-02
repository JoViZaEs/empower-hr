import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPermissionsMatrix } from "./UserPermissionsMatrix";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Role = Tables<"roles">;
type Module = Tables<"modules">;
type Permission = Tables<"permissions"> & {
  modules: { code: string; name: string } | null;
};
type RolePermission = Tables<"role_permissions">;
type UserPermission = Tables<"user_permissions">;

interface UserWithRoles extends Profile {
  user_roles: {
    role_id: string;
    roles: Role;
  }[];
}

interface UserRolesFormProps {
  user: UserWithRoles;
  roles: Role[];
  modules: Module[];
  permissions: Permission[];
  rolePermissions: RolePermission[];
  userPermissions: UserPermission[];
  onSubmit: (userId: string, roleIds: string[]) => void;
  onToggleUserPermission: (userId: string, permissionId: string, currentState: "granted" | "revoked" | "inherited" | "none") => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function UserRolesForm({
  user,
  roles,
  modules,
  permissions,
  rolePermissions,
  userPermissions,
  onSubmit,
  onToggleUserPermission,
  onCancel,
  isLoading,
}: UserRolesFormProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("roles");

  useEffect(() => {
    // Initialize with current user roles
    const currentRoleIds = user.user_roles?.map((ur) => ur.role_id) || [];
    setSelectedRoles(currentRoleIds);
  }, [user]);

  const handleToggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(user.user_id, selectedRoles);
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "U";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User info header */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <Avatar className="h-14 w-14">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {getInitials(user.first_name, user.last_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">
            {user.first_name || user.last_name
              ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
              : "Sin nombre"}
          </h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          {user.is_super_admin && (
            <Badge variant="default" className="mt-1 bg-amber-500">
              Super Admin
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs for roles and individual permissions */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permisos Individuales</TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles" className="space-y-3 mt-4">
          <Label className="text-base font-medium">Roles asignados</Label>
          {user.is_super_admin && (
            <p className="text-sm text-muted-foreground">
              Los Super Admins tienen todos los permisos automáticamente.
            </p>
          )}
          <ScrollArea className="h-[240px] rounded-md border p-4">
            {roles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay roles disponibles. Crea un rol primero.
              </p>
            ) : (
              <div className="space-y-3">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={() => handleToggleRole(role.id)}
                      disabled={isLoading}
                    />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor={`role-${role.id}`}
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                      >
                        {role.name}
                        {role.is_system && (
                          <Badge variant="outline" className="text-xs">
                            Sistema
                          </Badge>
                        )}
                      </Label>
                      {role.description && (
                        <p className="text-xs text-muted-foreground">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="permissions" className="mt-4">
          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium">Permisos individuales</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Otorga o revoca permisos específicos para este usuario, independiente de sus roles.
              </p>
            </div>
            <UserPermissionsMatrix
              userId={user.user_id}
              userRoleIds={selectedRoles}
              modules={modules}
              permissions={permissions}
              rolePermissions={rolePermissions}
              userPermissions={userPermissions}
              onToggleUserPermission={(permissionId, state) => 
                onToggleUserPermission(user.user_id, permissionId, state)
              }
              isSuperAdmin={user.is_super_admin || false}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
