import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope, Loader2 } from "lucide-react";
import { startOfMonth, endOfMonth } from "date-fns";

export function ExamStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["exam-stats"],
    queryFn: async () => {
      const now = new Date();
      const monthStart = startOfMonth(now).toISOString().split("T")[0];
      const monthEnd = endOfMonth(now).toISOString().split("T")[0];

      // Get all exams
      const { data: exams, error } = await supabase
        .from("exams")
        .select("id, status, scheduled_date, exam_date");

      if (error) throw error;

      // Filter for this month (scheduled or exam date)
      const thisMonthExams = exams?.filter((e) => {
        const date = e.scheduled_date || e.exam_date;
        return date && date >= monthStart && date <= monthEnd;
      }) || [];

      const total = thisMonthExams.length;
      const completed = thisMonthExams.filter((e) => e.status === "vigente").length;
      const pending = thisMonthExams.filter((e) => e.status === "pendiente").length;
      const expired = exams?.filter((e) => e.status === "vencido").length || 0;

      return {
        total,
        completed,
        pending,
        expired,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4 shadow-card flex items-center justify-center"
          >
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-4">
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Este mes</span>
        </div>
        <p className="mt-2 text-2xl font-bold">{stats?.total ?? 0}</p>
        <p className="text-sm text-muted-foreground">Exámenes programados</p>
      </div>
      <div className="rounded-xl border border-success/20 bg-success/5 p-4 shadow-card">
        <p className="text-sm text-muted-foreground">Completados</p>
        <p className="mt-2 text-2xl font-bold text-success">
          {stats?.completed ?? 0}
        </p>
      </div>
      <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 shadow-card">
        <p className="text-sm text-muted-foreground">Pendientes</p>
        <p className="mt-2 text-2xl font-bold text-warning">
          {stats?.pending ?? 0}
        </p>
      </div>
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 shadow-card">
        <p className="text-sm text-muted-foreground">Vencidos</p>
        <p className="mt-2 text-2xl font-bold text-destructive">
          {stats?.expired ?? 0}
        </p>
      </div>
    </div>
  );
}
