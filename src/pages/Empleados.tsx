import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, UserPlus, Filter, MoreVertical, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export default function Empleados() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const filteredEmployees = employees?.filter((emp) => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const term = searchTerm.toLowerCase();
    return (
      fullName.includes(term) ||
      emp.document_number.toLowerCase().includes(term) ||
      emp.position?.toLowerCase().includes(term) ||
      emp.department?.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Empleados</h1>
            <p className="mt-1 text-muted-foreground">
              Gestiona la información de tus empleados
            </p>
          </div>
          <Button className="gradient-primary">
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Empleado
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre, documento, cargo o área..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Área</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees && filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <TableRow 
                      key={employee.id} 
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => navigate(`/empleados/${employee.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {employee.first_name?.[0]}{employee.last_name?.[0]}
                          </div>
                          {employee.first_name} {employee.last_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.document_type} {employee.document_number}
                      </TableCell>
                      <TableCell>{employee.position || "-"}</TableCell>
                      <TableCell>{employee.department || "-"}</TableCell>
                      <TableCell>
                        {employee.active ? (
                          <Badge className="bg-success/10 text-success border-success/20">Activo</Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/empleados/${employee.id}`);
                            }}>
                              Ver perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              Historial
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Desactivar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No se encontraron empleados con ese criterio" : "No hay empleados registrados"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
