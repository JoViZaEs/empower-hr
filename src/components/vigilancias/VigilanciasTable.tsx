import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

interface VigilanciaWithEmployee extends Tables<"vigilancias"> {
  employees: {
    first_name: string;
    last_name: string;
    document_number: string;
  } | null;
}

interface Props {
  vigilancias: VigilanciaWithEmployee[];
  onViewDetails: (v: VigilanciaWithEmployee) => void;
  onEdit: (v: VigilanciaWithEmployee) => void;
  onDelete: (v: VigilanciaWithEmployee) => void;
  onChangeStatus: (v: VigilanciaWithEmployee, status: "activa" | "inactiva" | "vencida") => void;
}

const statusBadge: Record<string, React.ReactNode> = {
  activa: <Badge className="bg-success/10 text-success border-success/20">Activa</Badge>,
  inactiva: <Badge className="bg-muted text-muted-foreground">Inactiva</Badge>,
  vencida: <Badge className="bg-destructive/10 text-destructive border-destructive/20">Vencida</Badge>,
};

const formatDate = (date: string | null) => {
  if (!date) return "-";
  return format(new Date(date), "d MMM yyyy", { locale: es });
};

export function VigilanciasTable({ vigilancias, onViewDetails, onEdit, onDelete, onChangeStatus }: Props) {
  if (vigilancias.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">No hay vigilancias registradas</p>
        <p className="text-sm">Cree una nueva vigilancia para comenzar</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empleado</TableHead>
            <TableHead>Tipo de Vigilancia</TableHead>
            <TableHead>Diagnóstico</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead>Próximo Seguimiento</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vigilancias.map((vig) => (
            <TableRow key={vig.id}>
              <TableCell className="font-medium">
                {vig.employees
                  ? `${vig.employees.first_name} ${vig.employees.last_name}`
                  : "-"}
              </TableCell>
              <TableCell>{vig.vigilancia_type}</TableCell>
              <TableCell>{vig.diagnosis || "-"}</TableCell>
              <TableCell>{formatDate(vig.start_date)}</TableCell>
              <TableCell>{formatDate(vig.follow_up_date)}</TableCell>
              <TableCell>{statusBadge[vig.status || "activa"]}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(vig)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(vig)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    {vig.status === "activa" && (
                      <DropdownMenuItem onClick={() => onChangeStatus(vig, "inactiva")}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Marcar inactiva
                      </DropdownMenuItem>
                    )}
                    {vig.status !== "activa" && (
                      <DropdownMenuItem onClick={() => onChangeStatus(vig, "activa")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Reactivar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(vig)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
