import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Shirt, Package, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const recentDeliveries = [
  {
    id: "1",
    employee: "María García López",
    item: "Uniforme completo",
    quantity: 2,
    date: "15 Dic 2024",
    signed: true,
  },
  {
    id: "2",
    employee: "Juan Carlos Rodríguez",
    item: "Botas de seguridad",
    quantity: 1,
    date: "14 Dic 2024",
    signed: true,
  },
  {
    id: "3",
    employee: "Ana María Pérez",
    item: "EPP Completo",
    quantity: 1,
    date: "13 Dic 2024",
    signed: false,
  },
  {
    id: "4",
    employee: "Carlos Andrés Martínez",
    item: "Casco de seguridad",
    quantity: 1,
    date: "12 Dic 2024",
    signed: true,
  },
];

const pendingDeliveries = [
  { id: "1", employee: "Laura González", item: "Uniforme Q1 2025", dueDate: "05 Ene 2025" },
  { id: "2", employee: "Pedro Ramírez", item: "EPP Renovación", dueDate: "10 Ene 2025" },
  { id: "3", employee: "Sandra López", item: "Botas de seguridad", dueDate: "15 Ene 2025" },
];

export default function Dotacion() {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Entrega de Dotación</h1>
            <p className="mt-1 text-muted-foreground">
              Control de entregas de uniformes y elementos de protección
            </p>
          </div>
          <Button className="gradient-accent">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Entrega
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <Shirt className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-muted-foreground">Entregas este año</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-success/10 p-3 text-success">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">148</p>
              <p className="text-sm text-muted-foreground">Firmadas</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-warning/10 p-3 text-warning">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Pendientes de firma</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="rounded-lg bg-info/10 p-3 text-info">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Próximas entregas</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent deliveries */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Entregas Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Artículo</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Firma</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">{delivery.employee}</TableCell>
                        <TableCell>{delivery.item}</TableCell>
                        <TableCell>{delivery.quantity}</TableCell>
                        <TableCell className="text-muted-foreground">{delivery.date}</TableCell>
                        <TableCell>
                          {delivery.signed ? (
                            <Badge className="bg-success/10 text-success border-success/20">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Firmado
                            </Badge>
                          ) : (
                            <Badge className="bg-warning/10 text-warning border-warning/20">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Pendiente
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Pending deliveries */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Próximas Entregas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium">{delivery.employee}</p>
                        <p className="text-sm text-muted-foreground">{delivery.item}</p>
                      </div>
                      <Badge variant="outline">{delivery.dueDate}</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  Ver calendario completo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
