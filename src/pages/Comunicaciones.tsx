import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Send, 
  Users, 
  Building2, 
  Briefcase,
  ListChecks,
  Clock,
  CheckCircle2,
  XCircle,
  Settings
} from "lucide-react";

const comunicaciones = [
  {
    id: 1,
    asunto: "Actualización de políticas de seguridad",
    lista: "Todos los empleados",
    tipoLista: "general",
    destinatarios: 156,
    enviados: 156,
    leidos: 98,
    fecha: "2024-01-15",
    estado: "Enviado",
  },
  {
    id: 2,
    asunto: "Recordatorio capacitación alturas",
    lista: "Operadores de Planta",
    tipoLista: "cargo",
    destinatarios: 45,
    enviados: 45,
    leidos: 32,
    fecha: "2024-01-14",
    estado: "Enviado",
  },
  {
    id: 3,
    asunto: "Reunión mensual de área",
    lista: "Departamento Producción",
    tipoLista: "departamento",
    destinatarios: 38,
    enviados: 0,
    leidos: 0,
    fecha: "2024-01-16",
    estado: "Programado",
  },
  {
    id: 4,
    asunto: "Encuesta de clima laboral",
    lista: "Lista personalizada: Supervisores",
    tipoLista: "personalizada",
    destinatarios: 12,
    enviados: 12,
    leidos: 8,
    fecha: "2024-01-13",
    estado: "Enviado",
  },
];

const listas = [
  { id: 1, nombre: "Todos los empleados", tipo: "General", miembros: 156 },
  { id: 2, nombre: "Operadores de Planta", tipo: "Por Cargo", miembros: 45 },
  { id: 3, nombre: "Departamento Producción", tipo: "Por Departamento", miembros: 38 },
  { id: 4, nombre: "Supervisores", tipo: "Personalizada", miembros: 12 },
  { id: 5, nombre: "Personal Administrativo", tipo: "Por Área", miembros: 28 },
  { id: 6, nombre: "Comité COPASST", tipo: "Personalizada", miembros: 8 },
];

const estadoColor = {
  Enviado: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  Programado: "bg-blue-500/10 text-blue-600 border-blue-200",
  Borrador: "bg-slate-500/10 text-slate-600 border-slate-200",
  Fallido: "bg-destructive/10 text-destructive border-destructive/20",
};

const tipoListaIcon = {
  general: Users,
  cargo: Briefcase,
  departamento: Building2,
  personalizada: ListChecks,
};

export default function Comunicaciones() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Comunicaciones</h1>
            <p className="text-muted-foreground">
              Envío de correos masivos y gestión de listas de distribución
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurar SMTP
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Comunicación
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">48</p>
                  <p className="text-sm text-muted-foreground">Total Enviados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 p-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">92%</p>
                  <p className="text-sm text-muted-foreground">Tasa de Entrega</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">Programados</p>
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
                  <p className="text-2xl font-bold">6</p>
                  <p className="text-sm text-muted-foreground">Listas Activas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="comunicaciones" className="space-y-4">
          <TabsList>
            <TabsTrigger value="comunicaciones" className="gap-2">
              <Send className="h-4 w-4" />
              Comunicaciones
            </TabsTrigger>
            <TabsTrigger value="listas" className="gap-2">
              <ListChecks className="h-4 w-4" />
              Listas de Distribución
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comunicaciones" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Buscar por asunto..." className="pl-10" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Lista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="cargo">Por Cargo</SelectItem>
                      <SelectItem value="departamento">Por Departamento</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enviado">Enviado</SelectItem>
                      <SelectItem value="programado">Programado</SelectItem>
                      <SelectItem value="borrador">Borrador</SelectItem>
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
                <CardTitle>Historial de Comunicaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asunto</TableHead>
                      <TableHead>Lista</TableHead>
                      <TableHead>Destinatarios</TableHead>
                      <TableHead>Enviados</TableHead>
                      <TableHead>Leídos</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comunicaciones.map((com) => {
                      const IconComponent = tipoListaIcon[com.tipoLista as keyof typeof tipoListaIcon];
                      return (
                        <TableRow key={com.id}>
                          <TableCell className="font-medium">{com.asunto}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                              <span>{com.lista}</span>
                            </div>
                          </TableCell>
                          <TableCell>{com.destinatarios}</TableCell>
                          <TableCell>
                            {com.enviados > 0 ? (
                              <span className="text-emerald-600">{com.enviados}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {com.leidos > 0 ? (
                              <span>{com.leidos} ({Math.round((com.leidos / com.enviados) * 100)}%)</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{com.fecha}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={estadoColor[com.estado as keyof typeof estadoColor]}
                            >
                              {com.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Ver Detalle
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listas" className="space-y-4">
            <div className="flex justify-end">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Lista
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {listas.map((lista) => (
                <Card key={lista.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{lista.nombre}</CardTitle>
                        <CardDescription>{lista.tipo}</CardDescription>
                      </div>
                      <Badge variant="secondary">{lista.miembros} miembros</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Editar
                      </Button>
                      <Button size="sm" className="flex-1 gap-1">
                        <Send className="h-3 w-3" />
                        Enviar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
