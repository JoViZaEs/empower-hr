import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import { Plus, Search, Filter, Target, Award, BarChart3, Zap } from "lucide-react";

const evaluaciones = [
  {
    id: 1,
    empleado: "Carlos Rodríguez",
    cargo: "Operador de Maquinaria",
    competencia: "Operación de Equipos Pesados",
    nivelRequerido: 4,
    nivelActual: 3,
    brecha: 1,
    estado: "En Desarrollo",
  },
  {
    id: 2,
    empleado: "María García",
    cargo: "Supervisora de Planta",
    competencia: "Liderazgo de Equipos",
    nivelRequerido: 5,
    nivelActual: 5,
    brecha: 0,
    estado: "Cumple",
  },
  {
    id: 3,
    empleado: "Juan Pérez",
    cargo: "Técnico de Mantenimiento",
    competencia: "Mantenimiento Preventivo",
    nivelRequerido: 4,
    nivelActual: 4,
    brecha: 0,
    estado: "Cumple",
  },
  {
    id: 4,
    empleado: "Ana López",
    cargo: "Analista de Calidad",
    competencia: "Control de Calidad ISO",
    nivelRequerido: 5,
    nivelActual: 3,
    brecha: 2,
    estado: "Crítico",
  },
  {
    id: 5,
    empleado: "Pedro Martínez",
    cargo: "Electricista Industrial",
    competencia: "Sistemas Eléctricos Industriales",
    nivelRequerido: 4,
    nivelActual: 4,
    brecha: 0,
    estado: "Cumple",
  },
];

const estadoColor = {
  Cumple: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  "En Desarrollo": "bg-amber-500/10 text-amber-600 border-amber-200",
  Crítico: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function EvaluacionesCompetencias() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Evaluaciones de Competencias</h1>
            <p className="text-muted-foreground">
              Gestión y seguimiento de competencias del personal
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
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">45</p>
                  <p className="text-sm text-muted-foreground">Total Evaluaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <Award className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">32</p>
                  <p className="text-sm text-muted-foreground">Cumplen Nivel</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-amber-500/10 p-3">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">10</p>
                  <p className="text-sm text-muted-foreground">En Desarrollo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-destructive/10 p-3">
                  <Zap className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Brechas Críticas</p>
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
                <Input placeholder="Buscar empleado o competencia..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Competencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liderazgo">Liderazgo</SelectItem>
                  <SelectItem value="tecnicas">Técnicas</SelectItem>
                  <SelectItem value="seguridad">Seguridad</SelectItem>
                  <SelectItem value="calidad">Calidad</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cumple">Cumple</SelectItem>
                  <SelectItem value="desarrollo">En Desarrollo</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
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
            <CardTitle>Matriz de Competencias</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Competencia</TableHead>
                  <TableHead>Nivel Requerido</TableHead>
                  <TableHead>Nivel Actual</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluaciones.map((evaluacion) => (
                  <TableRow key={evaluacion.id}>
                    <TableCell className="font-medium">{evaluacion.empleado}</TableCell>
                    <TableCell>{evaluacion.cargo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{evaluacion.competencia}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{evaluacion.nivelRequerido}</TableCell>
                    <TableCell className="text-center">{evaluacion.nivelActual}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(evaluacion.nivelActual / evaluacion.nivelRequerido) * 100} 
                          className="h-2 w-20"
                        />
                        <span className="text-sm text-muted-foreground">
                          {Math.round((evaluacion.nivelActual / evaluacion.nivelRequerido) * 100)}%
                        </span>
                      </div>
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
