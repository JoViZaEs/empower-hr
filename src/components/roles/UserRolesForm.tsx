import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type Role = Tables<"roles">;

interface UserWithRoles extends Profile {
  user_roles: {
    role_id: string;
    roles: Role;
  }[];
}

interface UserRolesFormProps {
  user: UserWithRoles;
  roles: Role[];
  onSubmit: (userId: string, roleIds: string[]) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function UserRolesForm({
  user,
  roles,
  onSubmit,
  onCancel,
  isLoading,
}: UserRolesFormProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

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

      {/* Roles selection */}
      <div className="space-y-3">
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
      </div>

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
