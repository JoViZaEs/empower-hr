import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Json } from "@/integrations/supabase/types";

interface TenantSettings {
  nit?: string;
  address?: string;
  phone?: string;
  city?: string;
  country?: string;
  industry?: string;
  website?: string;
}

interface Tenant {
  id: string;
  name: string;
  settings: TenantSettings | null;
}

export function CompanySettings() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    nit: "",
    address: "",
    phone: "",
    city: "",
    country: "",
    industry: "",
    website: "",
  });

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenant", profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return null;
      
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, settings")
        .eq("id", profile.tenant_id)
        .single();
      
      if (error) throw error;
      return data as Tenant;
    },
    enabled: !!profile?.tenant_id,
  });

  useEffect(() => {
    if (tenant) {
      const settings = (tenant.settings || {}) as TenantSettings;
      setFormData({
        name: tenant.name || "",
        nit: settings.nit || "",
        address: settings.address || "",
        phone: settings.phone || "",
        city: settings.city || "",
        country: settings.country || "",
        industry: settings.industry || "",
        website: settings.website || "",
      });
    }
  }, [tenant]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!profile?.tenant_id) throw new Error("No tenant found");
      
      const settings = {
        nit: data.nit,
        address: data.address,
        phone: data.phone,
        city: data.city,
        country: data.country,
        industry: data.industry,
        website: data.website,
      };

      const { error } = await supabase
        .from("tenants")
        .update({
          name: data.name,
          settings: settings as Json,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.tenant_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
      toast.success("Información de la empresa actualizada");
    },
    onError: (error) => {
      console.error("Error updating company:", error);
      toast.error("Error al guardar los cambios");
    },
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!profile?.tenant_id) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No tienes una empresa asociada a tu cuenta.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Empresa</CardTitle>
        <CardDescription>
          Datos generales de tu organización
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nombre de la empresa</Label>
              <Input
                id="company-name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nombre de la empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nit">NIT / Identificación fiscal</Label>
              <Input
                id="nit"
                value={formData.nit}
                onChange={(e) => handleChange("nit", e.target.value)}
                placeholder="900.123.456-7"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Calle 100 #15-20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Bogotá"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="Colombia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+57 1 234 5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industria / Sector</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleChange("industry", e.target.value)}
                placeholder="Tecnología, Manufactura, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Sitio web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://www.empresa.com"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="gradient-primary"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar cambios
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
