import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Empleados from "./pages/Empleados";
import Vigilancias from "./pages/Vigilancias";
import Examenes from "./pages/Examenes";
import Dotacion from "./pages/Dotacion";
import Comites from "./pages/Comites";
import Eventos from "./pages/Eventos";
import Configuracion from "./pages/Configuracion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/empleados" element={<Empleados />} />
          <Route path="/vigilancias" element={<Vigilancias />} />
          <Route path="/examenes" element={<Examenes />} />
          <Route path="/dotacion" element={<Dotacion />} />
          <Route path="/comites" element={<Comites />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
