import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Search, Filter, ClipboardCheck, TrendingUp, Users, Loader2, Star, FileX } from "lucide-react";
import { EvaluacionForm } from "@/components/evaluaciones/EvaluacionForm";

const estadoColor: Record<string, string> = {
  completada: "bg-success/10 text-success border-success/20",
  en_proceso: "bg-warning/10 text-warning border-warning/20",
  pendiente: "bg-muted text-muted-foreground",
  cancelada: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function Evaluaciones() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);

  const { data: evaluations, isLoading } = useQuery({
    queryKey: ["evaluations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluations")
        .select("*, evaluation_templates(name, evaluation_type, scale_max), employees(first_name, last_name, position)")
        .order("evaluation_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: templates } = useQuery({
    queryKey: ["evaluation-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_templates")
        .select("id, name, evaluation_type")
        .eq("active", true);
      if (error) throw error;
      return data;
    },
  });

  const filtered = evaluations?.filter((e: any) => {
    const matchesSearch = !searchTerm || 
      `${e.employees?.first_name} ${e.employees?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.evaluation_templates?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: evaluations?.length || 0,
    completadas: evaluations?.filter((e: any) => e.status === "completada").length || 0,
    enProceso: evaluations?.filter((e: any) => e.status === "en_proceso").length || 0,
    pendientes: evaluations?.filter((e: any) => e.status === "pendiente").length || 0,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Evaluaciones</h1>
            <p className="text-muted-foreground">
              Gestión unificada de evaluaciones de desempeño, competencias y clima
            </p>
          </div>
          <Button className="gap-2" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Nueva Evaluación
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Evaluaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-success/10 p-3">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completadas}</p>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-warning/10 p-3">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.enProceso}</p>
                  <p className="text-sm text-muted-foreground">En Proceso</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <Star className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendientes}</p>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Buscar empleado o plantilla..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_proceso">En Proceso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Evaluaciones</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !filtered || filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FileX className="h-12 w-12 mb-2" />
                <p>No hay evaluaciones registradas</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Plantilla</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Puntaje</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((eval_: any) => (
                    <TableRow key={eval_.id}>
                      <TableCell className="font-medium">
                        {eval_.employees?.first_name} {eval_.employees?.last_name}
                      </TableCell>
                      <TableCell>{eval_.employees?.position || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {eval_.evaluation_templates?.evaluation_type || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>{eval_.evaluation_templates?.name || "-"}</TableCell>
                      <TableCell>{eval_.period}</TableCell>
                      <TableCell>
                        {format(new Date(eval_.evaluation_date), "d MMM yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        {eval_.overall_score ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span className="font-medium">{eval_.overall_score}</span>
                            <span className="text-muted-foreground">/{eval_.evaluation_templates?.scale_max || 5}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={estadoColor[eval_.status || "pendiente"]}>
                          {eval_.status === "en_proceso" ? "En proceso" : 
                           eval_.status?.charAt(0).toUpperCase() + eval_.status?.slice(1) || "Pendiente"}
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
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
