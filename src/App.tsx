import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Empleados from "./pages/Empleados";
import EmpleadoDetalle from "./pages/EmpleadoDetalle";
import Vigilancias from "./pages/Vigilancias";
import Examenes from "./pages/Examenes";
import Cursos from "./pages/Cursos";
import Dotacion from "./pages/Dotacion";
import Comites from "./pages/Comites";
import Eventos from "./pages/Eventos";
import Firmas from "./pages/Firmas";
import EvaluacionesDesempeno from "./pages/EvaluacionesDesempeno";
import EvaluacionesCompetencias from "./pages/EvaluacionesCompetencias";
import Comunicaciones from "./pages/Comunicaciones";
import Configuracion from "./pages/Configuracion";
import Notificaciones from "./pages/Notificaciones";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/empleados" element={<ProtectedRoute><Empleados /></ProtectedRoute>} />
            <Route path="/empleados/:id" element={<ProtectedRoute><EmpleadoDetalle /></ProtectedRoute>} />
            <Route path="/vigilancias" element={<ProtectedRoute><Vigilancias /></ProtectedRoute>} />
            <Route path="/examenes" element={<ProtectedRoute><Examenes /></ProtectedRoute>} />
            <Route path="/cursos" element={<ProtectedRoute><Cursos /></ProtectedRoute>} />
            <Route path="/dotacion" element={<ProtectedRoute><Dotacion /></ProtectedRoute>} />
            <Route path="/comites" element={<ProtectedRoute><Comites /></ProtectedRoute>} />
            <Route path="/eventos" element={<ProtectedRoute><Eventos /></ProtectedRoute>} />
            <Route path="/firmas" element={<ProtectedRoute><Firmas /></ProtectedRoute>} />
            <Route path="/evaluaciones-desempeno" element={<ProtectedRoute><EvaluacionesDesempeno /></ProtectedRoute>} />
            <Route path="/evaluaciones-competencias" element={<ProtectedRoute><EvaluacionesCompetencias /></ProtectedRoute>} />
            <Route path="/comunicaciones" element={<ProtectedRoute><Comunicaciones /></ProtectedRoute>} />
            <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
            <Route path="/notificaciones" element={<ProtectedRoute><Notificaciones /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
