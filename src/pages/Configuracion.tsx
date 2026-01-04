import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { CompanySettings } from "@/components/settings/CompanySettings";
import { UserManagementSettings } from "@/components/settings/UserManagementSettings";
import { AlertSettings } from "@/components/settings/AlertSettings";
import { EmailTemplatesSettings } from "@/components/settings/EmailTemplatesSettings";
import {
  Building2,
  Users,
  Bell,
  Shield,
  Mail,
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
            <AlertSettings />
          </TabsContent>

          <TabsContent value="correos">
            <EmailTemplatesSettings />
          </TabsContent>

          <TabsContent value="seguridad">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}