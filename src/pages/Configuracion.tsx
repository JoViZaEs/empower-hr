import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { UserManagementSettings } from "@/components/settings/UserManagementSettings";
import {
  Building2,
  Users,
  Bell,
  Shield,
  Mail,
  Save,
} from "lucide-react";

export default function Configuracion() {
  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="mt-1 text-muted-foreground">
            Personaliza la configuración de tu organización
          </p>
        </div>

        <Tabs defaultValue="empresa" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="empresa" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="notificaciones" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="correos" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Correos</span>
            </TabsTrigger>
            <TabsTrigger value="seguridad" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Seguridad</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="empresa">
            <CompanySettings />
          </TabsContent>

          <TabsContent value="usuarios">
            <UserManagementSettings />
          </TabsContent>

          <TabsContent value="notificaciones">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Alertas</CardTitle>
                <CardDescription>
                  Define cuándo y cómo recibir notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">Exámenes por vencer</p>
                      <p className="text-sm text-muted-foreground">
                        Notificar cuando falten 30 días para vencimiento
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">Firmas pendientes</p>
                      <p className="text-sm text-muted-foreground">
                        Recordar firmas pendientes cada 7 días
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">Vencimiento de comités</p>
                      <p className="text-sm text-muted-foreground">
                        Alertar 60 días antes del vencimiento
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">Entregas de dotación</p>
                      <p className="text-sm text-muted-foreground">
                        Recordar entregas programadas
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
                <Button className="gradient-primary">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar preferencias
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correos">
            <Card>
              <CardHeader>
                <CardTitle>Plantillas de Correo</CardTitle>
                <CardDescription>
                  Personaliza los correos automáticos del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Editor de plantillas de correo próximamente...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguridad">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}