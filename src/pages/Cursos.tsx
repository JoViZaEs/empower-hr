import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GraduationCap, Plus, AlertTriangle, CheckCircle, Clock, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const cursosData = [
  {
    id: 1,
    empleado: "Carlos Mendoza",
    curso: "Trabajo en Alturas",
    entidad: "SENA",
    fechaObtencion: "2024-03-15",
    fechaVencimiento: "2025-03-15",
    estado: "vigente",
  },
  {
    id: 2,
    empleado: "María López",
    curso: "Manipulación de Alimentos",
    entidad: "Secretaría de Salud",
    fechaObtencion: "2024-01-10",
    fechaVencimiento: "2025-01-10",
    estado: "por_vencer",
  },
  {
    id: 3,
    empleado: "Juan Rodríguez",
    curso: "Trabajo en Alturas",
    entidad: "SENA",
    fechaObtencion: "2023-06-20",
    fechaVencimiento: "2024-06-20",
    estado: "vencido",
  },
  {
    id: 4,
    empleado: "Ana García",
    curso: "Primeros Auxilios",
    entidad: "Cruz Roja",
    fechaObtencion: "2024-08-01",
    fechaVencimiento: "2026-08-01",
    estado: "vigente",
  },
  {
    id: 5,
    empleado: "Pedro Sánchez",
    curso: "Manejo de Extintores",
    entidad: "Bomberos",
    fechaObtencion: "2024-02-15",
    fechaVencimiento: "2025-02-15",
    estado: "por_vencer",
  },
];

const estadoBadge = {
  vigente: { label: "Vigente", variant: "default" as const, icon: CheckCircle },
  por_vencer: { label: "Por Vencer", variant: "warning" as const, icon: Clock },
  vencido: { label: "Vencido", variant: "destructive" as const, icon: AlertTriangle },
};

export default function Cursos() {
  const stats = {
    total: cursosData.length,
    vigentes: cursosData.filter((c) => c.estado === "vigente").length,
    porVencer: cursosData.filter((c) => c.estado === "por_vencer").length,
    vencidos: cursosData.filter((c) => c.estado === "vencido").length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cursos y Certificaciones</h1>
            <p className="text-muted-foreground">
              Control de cursos obligatorios y fechas de renovación
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Registrar Curso
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Registros</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.vigentes}</p>
                <p className="text-sm text-muted-foreground">Vigentes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.porVencer}</p>
                <p className="text-sm text-muted-foreground">Por Vencer</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.vencidos}</p>
                <p className="text-sm text-muted-foreground">Vencidos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Registro de Cursos</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-9 w-64" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead>Fecha Obtención</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cursosData.map((curso) => {
                  const estado = estadoBadge[curso.estado];
                  const IconEstado = estado.icon;
                  return (
                    <TableRow key={curso.id}>
                      <TableCell className="font-medium">{curso.empleado}</TableCell>
                      <TableCell>{curso.curso}</TableCell>
                      <TableCell>{curso.entidad}</TableCell>
                      <TableCell>{new Date(curso.fechaObtencion).toLocaleDateString("es-CO")}</TableCell>
                      <TableCell>{new Date(curso.fechaVencimiento).toLocaleDateString("es-CO")}</TableCell>
                      <TableCell>
                        <Badge variant={estado.variant} className="gap-1">
                          <IconEstado className="h-3 w-3" />
                          {estado.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Ver
                        </Button>
                        <Button variant="ghost" size="sm">
                          Renovar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
