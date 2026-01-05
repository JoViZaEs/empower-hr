import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Bell, Users, User } from "lucide-react";

interface NotificationPreference {
  id?: string;
  user_id?: string;
  role_id?: string;
  tenant_id: string;
  receive_summary: boolean;
  summary_frequency: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
}

export default function NotificationPreferencesSettings() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("personal");

  // Preferencias personales del usuario
  const { data: userPreference, isLoading: loadingUserPref } = useQuery({
    queryKey: ["notification-preferences", user?.id],
    queryFn: async () => {
      if (!user?.id || !profile?.tenant_id) return null;

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .eq("tenant_id", profile.tenant_id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!profile?.tenant_id,
  });

  // Roles del tenant
  const { data: roles = [] } = useQuery({
    queryKey: ["roles", profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return [];

      const { data, error } = await supabase
        .from("roles")
        .select("id, name, description")
        .eq("tenant_id", profile.tenant_id);

      if (error) throw error;
      return data as Role[];
    },
    enabled: !!profile?.tenant_id,
  });

  // Preferencias por rol
  const { data: rolePreferences = [], isLoading: loadingRolePrefs } = useQuery({
    queryKey: ["role-notification-preferences", profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return [];

      const { data, error } = await supabase
        .from("role_notification_preferences")
        .select("*")
        .eq("tenant_id", profile.tenant_id);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id && profile?.is_super_admin,
  });

  // Estado local para preferencias personales
  const [personalPrefs, setPersonalPrefs] = useState<NotificationPreference>({
    tenant_id: profile?.tenant_id || "",
    receive_summary: false,
    summary_frequency: "daily",
    email_enabled: true,
    in_app_enabled: true,
  });

  // Estado local para preferencias de roles
  const [rolePrefs, setRolePrefs] = useState<Record<string, NotificationPreference>>({});

  useEffect(() => {
    if (userPreference) {
      setPersonalPrefs({
        id: userPreference.id,
        user_id: userPreference.user_id,
        tenant_id: userPreference.tenant_id,
        receive_summary: userPreference.receive_summary ?? false,
        summary_frequency: userPreference.summary_frequency ?? "daily",
        email_enabled: userPreference.email_enabled ?? true,
        in_app_enabled: userPreference.in_app_enabled ?? true,
      });
    } else if (profile?.tenant_id) {
      setPersonalPrefs(prev => ({ ...prev, tenant_id: profile.tenant_id! }));
    }
  }, [userPreference, profile?.tenant_id]);

  useEffect(() => {
    const prefs: Record<string, NotificationPreference> = {};
    for (const rolePref of rolePreferences) {
      prefs[rolePref.role_id] = {
        id: rolePref.id,
        role_id: rolePref.role_id,
        tenant_id: rolePref.tenant_id,
        receive_summary: rolePref.receive_summary ?? false,
        summary_frequency: rolePref.summary_frequency ?? "daily",
        email_enabled: rolePref.email_enabled ?? true,
        in_app_enabled: rolePref.in_app_enabled ?? true,
      };
    }
    setRolePrefs(prefs);
  }, [rolePreferences]);

  // Mutación para guardar preferencias personales
  const savePersonalPrefsMutation = useMutation({
    mutationFn: async (prefs: NotificationPreference) => {
      if (prefs.id) {
        const { error } = await supabase
          .from("notification_preferences")
          .update({
            receive_summary: prefs.receive_summary,
            summary_frequency: prefs.summary_frequency,
            email_enabled: prefs.email_enabled,
            in_app_enabled: prefs.in_app_enabled,
          })
          .eq("id", prefs.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notification_preferences")
          .insert({
            user_id: user!.id,
            tenant_id: prefs.tenant_id,
            receive_summary: prefs.receive_summary,
            summary_frequency: prefs.summary_frequency,
            email_enabled: prefs.email_enabled,
            in_app_enabled: prefs.in_app_enabled,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Preferencias guardadas correctamente");
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
    onError: (error) => {
      toast.error("Error al guardar preferencias");
      console.error(error);
    },
  });

  // Mutación para guardar preferencias de rol
  const saveRolePrefsMutation = useMutation({
    mutationFn: async ({ roleId, prefs }: { roleId: string; prefs: NotificationPreference }) => {
      if (prefs.id) {
        const { error } = await supabase
          .from("role_notification_preferences")
          .update({
            receive_summary: prefs.receive_summary,
            summary_frequency: prefs.summary_frequency,
            email_enabled: prefs.email_enabled,
            in_app_enabled: prefs.in_app_enabled,
          })
          .eq("id", prefs.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("role_notification_preferences")
          .insert({
            role_id: roleId,
            tenant_id: profile!.tenant_id!,
            receive_summary: prefs.receive_summary,
            summary_frequency: prefs.summary_frequency,
            email_enabled: prefs.email_enabled,
            in_app_enabled: prefs.in_app_enabled,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Preferencias del rol guardadas");
      queryClient.invalidateQueries({ queryKey: ["role-notification-preferences"] });
    },
    onError: (error) => {
      toast.error("Error al guardar preferencias del rol");
      console.error(error);
    },
  });

  const handleRolePrefChange = (roleId: string, field: keyof NotificationPreference, value: any) => {
    setRolePrefs(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId] || {
          tenant_id: profile?.tenant_id || "",
          receive_summary: false,
          summary_frequency: "daily",
          email_enabled: true,
          in_app_enabled: true,
        },
        [field]: value,
      },
    }));
  };

  const renderPreferenceForm = (
    prefs: NotificationPreference,
    onChange: (field: keyof NotificationPreference, value: any) => void,
    onSave: () => void,
    isLoading: boolean
  ) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Notificaciones en la aplicación</Label>
          <p className="text-sm text-muted-foreground">
            Recibir notificaciones dentro de la plataforma
          </p>
        </div>
        <Switch
          checked={prefs.in_app_enabled}
          onCheckedChange={(checked) => onChange("in_app_enabled", checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Notificaciones por email</Label>
          <p className="text-sm text-muted-foreground">
            Recibir alertas importantes por correo electrónico
          </p>
        </div>
        <Switch
          checked={prefs.email_enabled}
          onCheckedChange={(checked) => onChange("email_enabled", checked)}
        />
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              Recibir resúmenes consolidados
              <Badge variant="secondary">Recomendado para administradores</Badge>
            </Label>
            <p className="text-sm text-muted-foreground">
              En lugar de notificaciones individuales, recibe un resumen periódico con todas las alertas
            </p>
          </div>
          <Switch
            checked={prefs.receive_summary}
            onCheckedChange={(checked) => onChange("receive_summary", checked)}
          />
        </div>

        {prefs.receive_summary && (
          <div className="ml-4 space-y-2">
            <Label>Frecuencia del resumen</Label>
            <Select
              value={prefs.summary_frequency}
              onValueChange={(value) => onChange("summary_frequency", value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Button onClick={onSave} disabled={isLoading} className="mt-4">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar preferencias
      </Button>
    </div>
  );

  if (loadingUserPref) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Preferencias de notificaciones
        </CardTitle>
        <CardDescription>
          Configura cómo y cuándo deseas recibir las notificaciones del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Mis preferencias
            </TabsTrigger>
            {profile?.is_super_admin && (
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Preferencias por rol
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="personal">
            {renderPreferenceForm(
              personalPrefs,
              (field, value) => setPersonalPrefs(prev => ({ ...prev, [field]: value })),
              () => savePersonalPrefsMutation.mutate(personalPrefs),
              savePersonalPrefsMutation.isPending
            )}
          </TabsContent>

          {profile?.is_super_admin && (
            <TabsContent value="roles">
              <p className="text-sm text-muted-foreground mb-6">
                Configura las preferencias predeterminadas por rol. Los usuarios pueden sobrescribir estas configuraciones con sus preferencias personales.
              </p>
              
              {loadingRolePrefs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {roles.map((role) => {
                    const rolePref = rolePrefs[role.id] || {
                      tenant_id: profile.tenant_id || "",
                      receive_summary: false,
                      summary_frequency: "daily",
                      email_enabled: true,
                      in_app_enabled: true,
                    };

                    return (
                      <Card key={role.id} className="border-muted">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            {role.name}
                            {role.name === "Administrador" && (
                              <Badge variant="outline">Sistema</Badge>
                            )}
                          </CardTitle>
                          {role.description && (
                            <CardDescription>{role.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          {renderPreferenceForm(
                            rolePref,
                            (field, value) => handleRolePrefChange(role.id, field, value),
                            () => saveRolePrefsMutation.mutate({ roleId: role.id, prefs: rolePrefs[role.id] || rolePref }),
                            saveRolePrefsMutation.isPending
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}