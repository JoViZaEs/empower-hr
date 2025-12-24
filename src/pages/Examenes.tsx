import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarPlus, Stethoscope, Download, Eye, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const exams = [
  {
    id: "1",
    employee: "María García López",
    type: "Periódico",
    entity: "IPS Salud Total",
    scheduledDate: "15 Dic 2024",
    status: "completed",
    result: "Apto",
  },
  {
    id: "2",
    employee: "Juan Carlos Rodríguez",
    type: "Ingreso",
    entity: "Colsanitas",
    scheduledDate: "20 Dic 2024",
    status: "scheduled",
    result: null,
  },
  {
    id: "3",
    employee: "Ana María Pérez",
    type: "Periódico",
    entity: "IPS Salud Total",
    scheduledDate: "10 Dic 2024",
    status: "pending",
    result: null,
  },
  {
    id: "4",
    employee: "Carlos Andrés Martínez",
    type: "Retiro",
    entity: "Sura EPS",
    scheduledDate: "05 Dic 2024",
    status: "completed",
    result: "Apto con restricciones",
  },
  {
    id: "5",
    employee: "Laura Sofía González",
    type: "Periódico",
    entity: "IPS Salud Total",
    scheduledDate: "28 Dic 2024",
    status: "scheduled",
    result: null,
  },
];

const statusBadge = {
  completed: <Badge className="bg-success/10 text-success border-success/20">Completado</Badge>,
  scheduled: <Badge className="bg-info/10 text-info border-info/20">Programado</Badge>,
  pending: <Badge className="bg-warning/10 text-warning border-warning/20">Pendiente</Badge>,
  expired: <Badge className="bg-destructive/10 text-destructive border-destructive/20">Vencido</Badge>,
};

const typeBadge = {
  Ingreso: "bg-primary/10 text-primary border-primary/20",
  Periódico: "bg-info/10 text-info border-info/20",
  Retiro: "bg-muted text-muted-foreground border-muted",
};

export default function Examenes() {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Exámenes Médicos</h1>
            <p className="mt-1 text-muted-foreground">
              Programación y seguimiento de exámenes ocupacionales
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button className="gradient-primary">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Programar Examen
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Este mes</span>
            </div>
            <p className="mt-2 text-2xl font-bold">24</p>
            <p className="text-sm text-muted-foreground">Exámenes programados</p>
          </div>
          <div className="rounded-xl border border-success/20 bg-success/5 p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Completados</p>
            <p className="mt-2 text-2xl font-bold text-success">18</p>
          </div>
          <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Pendientes</p>
            <p className="mt-2 text-2xl font-bold text-warning">4</p>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Vencidos</p>
            <p className="mt-2 text-2xl font-bold text-destructive">2</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="ingreso">Ingreso</TabsTrigger>
            <TabsTrigger value="periodico">Periódicos</TabsTrigger>
            <TabsTrigger value="retiro">Retiro</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Empleado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{exam.employee}</TableCell>
                      <TableCell>
                        <Badge className={typeBadge[exam.type as keyof typeof typeBadge]}>
                          {exam.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{exam.entity}</TableCell>
                      <TableCell>{exam.scheduledDate}</TableCell>
                      <TableCell>{statusBadge[exam.status as keyof typeof statusBadge]}</TableCell>
                      <TableCell>
                        {exam.result ? (
                          <span className="font-medium">{exam.result}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Adjuntar resultado</DropdownMenuItem>
                            <DropdownMenuItem>Enviar recordatorio</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="ingreso">
            <p className="text-muted-foreground">Exámenes de ingreso...</p>
          </TabsContent>
          <TabsContent value="periodico">
            <p className="text-muted-foreground">Exámenes periódicos...</p>
          </TabsContent>
          <TabsContent value="retiro">
            <p className="text-muted-foreground">Exámenes de retiro...</p>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
