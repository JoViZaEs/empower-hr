import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, CheckCheck, Filter, Inbox, AlertTriangle, Info, Calendar, GraduationCap, Stethoscope, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Notification {
  id: string;
  tenant_id: string;
  user_id: string;
  title: string;
  message: string;
  type: string | null;
  link: string | null;
  read: boolean | null;
  created_at: string | null;
}

const ITEMS_PER_PAGE = 10;

const notificationTypes = [
  { value: "all", label: "Todos los tipos", icon: Bell },
  { value: "info", label: "Información", icon: Info },
  { value: "warning", label: "Advertencia", icon: AlertTriangle },
  { value: "exam", label: "Exámenes", icon: Stethoscope },
  { value: "course", label: "Cursos", icon: GraduationCap },
  { value: "event", label: "Eventos", icon: Calendar },
];

const getTypeIcon = (type: string | null) => {
  switch (type) {
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case "exam":
      return <Stethoscope className="h-4 w-4 text-blue-500" />;
    case "course":
      return <GraduationCap className="h-4 w-4 text-green-500" />;
    case "event":
      return <Calendar className="h-4 w-4 text-purple-500" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />;
  }
};

const getTypeBadge = (type: string | null) => {
  switch (type) {
    case "warning":
      return <Badge variant="outline" className="border-amber-500 text-amber-600">Advertencia</Badge>;
    case "exam":
      return <Badge variant="outline" className="border-blue-500 text-blue-600">Examen</Badge>;
    case "course":
      return <Badge variant="outline" className="border-green-500 text-green-600">Curso</Badge>;
    case "event":
      return <Badge variant="outline" className="border-purple-500 text-purple-600">Evento</Badge>;
    default:
      return <Badge variant="outline">Información</Badge>;
  }
};

export default function Notificaciones() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["all-notifications", user?.id, typeFilter, readFilter, currentPage],
    queryFn: async () => {
      if (!user?.id) return { notifications: [], count: 0 };

      let query = supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }

      if (readFilter === "unread") {
        query = query.eq("read", false);
      } else if (readFilter === "read") {
        query = query.eq("read", true);
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      return { notifications: data as Notification[], count: count || 0 };
    },
    enabled: !!user?.id,
  });

  const notifications = notificationsData?.notifications || [];
  const totalCount = notificationsData?.count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const clearFilters = () => {
    setTypeFilter("all");
    setReadFilter("all");
    setCurrentPage(1);
  };

  const hasFilters = typeFilter !== "all" || readFilter !== "all";

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
            <p className="text-muted-foreground">
              Historial completo de tus notificaciones
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Filtros</CardTitle>
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-3 w-3" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="w-full sm:w-auto">
                <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Tipo de notificación" />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-auto">
                <Select value={readFilter} onValueChange={(value: "all" | "unread" | "read") => { setReadFilter(value); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="unread">No leídas</SelectItem>
                    <SelectItem value="read">Leídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {totalCount} {totalCount === 1 ? "notificación" : "notificaciones"}
            </CardTitle>
            <CardDescription>
              {hasFilters ? "Resultados filtrados" : "Mostrando todas las notificaciones"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4 p-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No hay notificaciones</h3>
                <p className="text-sm text-muted-foreground">
                  {hasFilters
                    ? "No se encontraron notificaciones con los filtros seleccionados"
                    : "Aún no tienes notificaciones"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex gap-4 p-4 transition-colors hover:bg-muted/50 ${
                      !notification.read ? "bg-muted/30" : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                            {notification.title}
                          </span>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(notification.type)}
                          {notification.created_at && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(notification.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 pt-1">
                        {notification.created_at && (
                          <span className="text-xs text-muted-foreground/70">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </span>
                        )}
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            <CheckCheck className="mr-1 h-3 w-3" />
                            Marcar como leída
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <span className="px-2">...</span>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
