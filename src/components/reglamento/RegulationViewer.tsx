import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Loader2, PenTool, CheckCircle2, BookOpen, ArrowDown } from "lucide-react";
import { SignatureDialog } from "@/components/firmas/SignatureDialog";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regulationId: string | null;
}

export function RegulationViewer({ open, onOpenChange, regulationId }: Props) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: regulation, isLoading } = useQuery({
    queryKey: ["regulation-detail", regulationId],
    queryFn: async () => {
      if (!regulationId) return null;
      const { data, error } = await supabase
        .from("regulations")
        .select("*")
        .eq("id", regulationId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: open && !!regulationId,
  });

  // Check if current user's employee has already acknowledged
  const { data: acknowledgment } = useQuery({
    queryKey: ["my-acknowledgment", regulationId],
    queryFn: async () => {
      if (!regulationId) return null;
      // Find employee linked to current user (by email)
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) return null;

      const { data: emp } = await supabase
        .from("employees")
        .select("id")
        .eq("email", user.user.email)
        .limit(1)
        .maybeSingle();

      if (!emp) return null;

      const { data } = await supabase
        .from("regulation_acknowledgments")
        .select("*")
        .eq("regulation_id", regulationId)
        .eq("employee_id", emp.id)
        .maybeSingle();
      return { ack: data, employeeId: emp.id };
    },
    enabled: open && !!regulationId,
  });

  const isAlreadySigned = acknowledgment?.ack?.status === "firmado";

  // Reset scroll state when regulation changes
  useEffect(() => {
    setHasScrolledToBottom(false);
  }, [regulationId]);

  // Scroll detection
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 50;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  }, []);

  // Check if content is short enough to not need scrolling
  useEffect(() => {
    const el = scrollRef.current;
    if (el && el.scrollHeight <= el.clientHeight) {
      setHasScrolledToBottom(true);
    }
  }, [regulation]);

  const canSign = hasScrolledToBottom && !isAlreadySigned && regulation?.requires_signature && regulation?.status === "publicado" && acknowledgment?.employeeId;

  const signMutation = useMutation({
    mutationFn: async (signatureUrl: string) => {
      if (!acknowledgment?.employeeId || !regulationId) throw new Error("Datos incompletos");

      // Upsert acknowledgment
      const { error } = await supabase
        .from("regulation_acknowledgments")
        .upsert({
          tenant_id: profile?.tenant_id!,
          regulation_id: regulationId,
          employee_id: acknowledgment.employeeId,
          acknowledged_at: new Date().toISOString(),
          signature_url: signatureUrl,
          status: "firmado",
        }, { onConflict: "regulation_id,employee_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reglamento firmado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["my-acknowledgment", regulationId] });
      queryClient.invalidateQueries({ queryKey: ["regulation-acknowledgments"] });
      setShowSignature(false);
    },
    onError: (err: any) => toast.error("Error: " + err.message),
  });

  const handleSignatureComplete = (signatureUrl: string) => {
    signMutation.mutate(signatureUrl);
  };

  const scrollProgress = (() => {
    const el = scrollRef.current;
    if (!el || el.scrollHeight <= el.clientHeight) return 100;
    return Math.min(100, Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100));
  })();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {regulation?.title || "Reglamento"}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">v{regulation?.version}</Badge>
                  <Badge variant="outline" className={statusColor[regulation?.status || ""]}>
                    {regulation?.status === "publicado" ? "Publicado" : regulation?.status === "borrador" ? "Borrador" : "Archivado"}
                  </Badge>
                  {isAlreadySigned && (
                    <Badge className="bg-success/10 text-success border-success/20 gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Firmado
                    </Badge>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <>
              {/* Reading progress */}
              {!isAlreadySigned && regulation?.requires_signature && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progreso de lectura</span>
                    <span>{hasScrolledToBottom ? "✓ Lectura completa" : "Desplácese hasta el final"}</span>
                  </div>
                  <Progress value={hasScrolledToBottom ? 100 : scrollProgress} className="h-1.5" />
                </div>
              )}

              {/* Content area */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto border rounded-lg p-6 bg-card min-h-0"
                style={{ maxHeight: "50vh" }}
              >
                <div ref={contentRef}>
                  {regulation?.content_type === "text" ? (
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground leading-relaxed">
                      {regulation.content_text}
                    </div>
                  ) : regulation?.document_url ? (
                    <iframe
                      src={regulation.document_url}
                      className="w-full h-[500px] border-0"
                      title="Reglamento PDF"
                    />
                  ) : (
                    <p className="text-muted-foreground text-center py-8">Sin contenido</p>
                  )}
                </div>
              </div>

              {/* Scroll hint */}
              {!hasScrolledToBottom && regulation?.requires_signature && !isAlreadySigned && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-bounce">
                  <ArrowDown className="h-4 w-4" />
                  <span>Desplácese hasta el final para habilitar la firma</span>
                </div>
              )}
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
            {regulation?.requires_signature && !isAlreadySigned && (
              <Button
                className="gap-2"
                disabled={!canSign}
                onClick={() => setShowSignature(true)}
              >
                <PenTool className="h-4 w-4" />
                {hasScrolledToBottom ? "Firmar Lectura" : "Lea el documento completo"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showSignature && acknowledgment?.employeeId && (
        <SignatureDialog
          open={showSignature}
          onOpenChange={setShowSignature}
          module="reglamento"
          recordId={regulationId || ""}
          employeeId={acknowledgment.employeeId}
          onSuccess={handleSignatureComplete}
        />
      )}
    </>
  );
}

const statusColor: Record<string, string> = {
  borrador: "bg-muted text-muted-foreground",
  publicado: "bg-success/10 text-success border-success/20",
  archivado: "bg-warning/10 text-warning border-warning/20",
};
