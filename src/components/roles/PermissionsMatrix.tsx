import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Plus, Pencil, Trash2, FileSignature, CheckCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Role = Tables<"roles">;
type Module = Tables<"modules">;
type Permission = Tables<"permissions"> & {
  modules: { code: string; name: string } | null;
};
type RolePermission = Tables<"role_permissions">;

interface PermissionsMatrixProps {
  roles: Role[];
  modules: Module[];
  permissions: Permission[];
  rolePermissions: RolePermission[];
  onTogglePermission: (roleId: string, permissionId: string, currentlyGranted: boolean) => void;
}

const actionIcons: Record<string, React.ReactNode> = {
  ver: <Eye className="h-3.5 w-3.5" />,
  crear: <Plus className="h-3.5 w-3.5" />,
  editar: <Pencil className="h-3.5 w-3.5" />,
  eliminar: <Trash2 className="h-3.5 w-3.5" />,
  firmar: <FileSignature className="h-3.5 w-3.5" />,
  aprobar: <CheckCircle className="h-3.5 w-3.5" />,
};

const actionLabels: Record<string, string> = {
  ver: "Ver",
  crear: "Crear",
  editar: "Editar",
  eliminar: "Eliminar",
  firmar: "Firmar",
  aprobar: "Aprobar",
};

export function PermissionsMatrix({
  roles,
  modules,
  permissions,
  rolePermissions,
  onTogglePermission,
}: PermissionsMatrixProps) {
  const hasPermission = (roleId: string, permissionId: string): boolean => {
    return rolePermissions.some(
      (rp) => rp.role_id === roleId && rp.permission_id === permissionId
    );
  };

  const getModulePermissions = (moduleCode: string): Permission[] => {
    return permissions.filter((p) => p.modules?.code === moduleCode);
  };

  if (roles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">
            Crea roles primero para asignar permisos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Matriz de Permisos por Módulo</CardTitle>
        <p className="text-sm text-muted-foreground">
          Marca los permisos que deseas asignar a cada rol
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-48 bg-muted/50 font-semibold">
                    Módulo / Acción
                  </TableHead>
                  {roles.map((role) => (
                    <TableHead
                      key={role.id}
                      className="bg-muted/50 text-center font-semibold"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm">{role.name}</span>
                        {role.is_system && (
                          <Badge variant="outline" className="text-xs">
                            Sistema
                          </Badge>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((module) => {
                  const modulePermissions = getModulePermissions(module.code);
                  if (modulePermissions.length === 0) return null;

                  return (
                    <>
                      <TableRow
                        key={`module-${module.id}`}
                        className="bg-secondary/30 hover:bg-secondary/40"
                      >
                        <TableCell
                          colSpan={roles.length + 1}
                          className="font-semibold text-foreground"
                        >
                          {module.name}
                        </TableCell>
                      </TableRow>
                      {modulePermissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell className="pl-8">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {actionIcons[permission.action] || null}
                              </span>
                              <span className="text-sm">
                                {actionLabels[permission.action] || permission.action}
                              </span>
                            </div>
                          </TableCell>
                          {roles.map((role) => {
                            const isGranted = hasPermission(role.id, permission.id);
                            return (
                              <TableCell key={`${role.id}-${permission.id}`} className="text-center">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex justify-center">
                                      <Checkbox
                                        checked={isGranted}
                                        onCheckedChange={() =>
                                          onTogglePermission(role.id, permission.id, isGranted)
                                        }
                                        disabled={role.is_system ?? false}
                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {isGranted ? "Quitar" : "Asignar"} permiso de{" "}
                                      {actionLabels[permission.action]?.toLowerCase()} en {module.name}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
