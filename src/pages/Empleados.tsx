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
import { Search, UserPlus, Filter, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const employees = [
  {
    id: "1",
    name: "María García López",
    document: "1234567890",
    position: "Analista de Calidad",
    area: "Producción",
    status: "active",
    examStatus: "ok",
  },
  {
    id: "2",
    name: "Juan Carlos Rodríguez",
    document: "0987654321",
    position: "Operador de Máquinas",
    area: "Planta",
    status: "active",
    examStatus: "warning",
  },
  {
    id: "3",
    name: "Ana María Pérez",
    document: "5678901234",
    position: "Supervisora SST",
    area: "Seguridad",
    status: "active",
    examStatus: "ok",
  },
  {
    id: "4",
    name: "Carlos Andrés Martínez",
    document: "4321098765",
    position: "Técnico de Mantenimiento",
    area: "Mantenimiento",
    status: "inactive",
    examStatus: "expired",
  },
  {
    id: "5",
    name: "Laura Sofía González",
    document: "8765432109",
    position: "Coordinadora RRHH",
    area: "Recursos Humanos",
    status: "active",
    examStatus: "ok",
  },
];

const statusBadge = {
  active: <Badge className="bg-success/10 text-success border-success/20">Activo</Badge>,
  inactive: <Badge className="bg-muted text-muted-foreground">Inactivo</Badge>,
};

const examBadge = {
  ok: <Badge className="bg-success/10 text-success border-success/20">Al día</Badge>,
  warning: <Badge className="bg-warning/10 text-warning border-warning/20">Por vencer</Badge>,
  expired: <Badge className="bg-destructive/10 text-destructive border-destructive/20">Vencido</Badge>,
};

export default function Empleados() {
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
            <Input placeholder="Buscar por nombre o documento..." className="pl-10" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Exámenes</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell className="text-muted-foreground">{employee.document}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.area}</TableCell>
                  <TableCell>{statusBadge[employee.status as keyof typeof statusBadge]}</TableCell>
                  <TableCell>{examBadge[employee.examStatus as keyof typeof examBadge]}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Historial</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Desactivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
