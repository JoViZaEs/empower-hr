import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, TrendingUp, Users, ClipboardCheck, Eye, EyeOff, Star } from "lucide-react";

const evaluaciones = [
  {
    id: 1,
    empleado: "Carlos Rodríguez",
    cargo: "Operador de Maquinaria",
    periodo: "2024-Q1",
    tipo: "Trimestral",
    puntuacion: 4.2,
    estado: "Completada",
    anonima: false,
  },
  {
    id: 2,
    empleado: "María García",
    cargo: "Supervisora de Planta",
    periodo: "2024-Q1",
    tipo: "Trimestral",
    puntuacion: 4.8,
    estado: "Completada",
    anonima: false,
  },
  {
    id: 3,
    empleado: "Juan Pérez",
    cargo: "Técnico de Mantenimiento",
    periodo: "2024-Q1",
    tipo: "360°",
    puntuacion: null,
    estado: "En Proceso",
    anonima: true,
  },
  {
    id: 4,
    empleado: "Ana López",
    cargo: "Analista de Calidad",
    periodo: "2024-Q1",
    tipo: "Anual",
    puntuacion: null,
    estado: "Pendiente",
    anonima: false,
  },
];

const estadoColor = {
  Completada: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  "En Proceso": "bg-amber-500/10 text-amber-600 border-amber-200",
  Pendiente: "bg-slate-500/10 text-slate-600 border-slate-200",
};

export default function EvaluacionesDesempeno() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Evaluaciones de Desempeño</h1>
            <p className="text-muted-foreground">
              Gestión de evaluaciones periódicas del personal
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Evaluación
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-sm text-muted-foreground">Total Evaluaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-sm text-muted-foreground">En Proceso</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-purple-500/10 p-3">
                  <EyeOff className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">6</p>
                  <p className="text-sm text-muted-foreground">Anónimas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar empleado..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="semestral">Semestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="360">360°</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="proceso">En Proceso</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Listado de Evaluaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Puntuación</TableHead>
                  <TableHead>Anónima</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluaciones.map((evaluacion) => (
                  <TableRow key={evaluacion.id}>
                    <TableCell className="font-medium">{evaluacion.empleado}</TableCell>
                    <TableCell>{evaluacion.cargo}</TableCell>
                    <TableCell>{evaluacion.periodo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{evaluacion.tipo}</Badge>
                    </TableCell>
                    <TableCell>
                      {evaluacion.puntuacion ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{evaluacion.puntuacion}</span>
                          <span className="text-muted-foreground">/5</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {evaluacion.anonima ? (
                        <div className="flex items-center gap-1 text-purple-600">
                          <EyeOff className="h-4 w-4" />
                          <span className="text-sm">Sí</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">No</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={estadoColor[evaluacion.estado as keyof typeof estadoColor]}
                      >
                        {evaluacion.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
