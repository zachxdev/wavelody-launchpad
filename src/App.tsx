import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Access from "./pages/Access.tsx";
import AuthSuccess from "./pages/AuthSuccess.tsx";
import Workspace from "./pages/Workspace.tsx";
import LivingEngine from "./pages/LivingEngine.tsx";
import LivingEngineIterations from "./pages/LivingEngineIterations.tsx";
import LivingEngineVerdict from "./pages/LivingEngineVerdict.tsx";
import WanderingLullaby from "./pages/WanderingLullaby.tsx";
import WanderingLullabyIterations from "./pages/WanderingLullabyIterations.tsx";
import TheHiddenHeart from "./pages/TheHiddenHeart.tsx";
import TheHiddenHeartIterations from "./pages/TheHiddenHeartIterations.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Catalog landing */}
          <Route path="/" element={<Index />} />

          {/* Piece I — The Living Engine */}
          <Route path="/the-living-engine" element={<LivingEngine />} />
          <Route
            path="/the-living-engine/iterations"
            element={<LivingEngineIterations />}
          />
          <Route
            path="/the-living-engine/verdict"
            element={<LivingEngineVerdict />}
          />

          {/* Piece II — The Wandering Lullaby */}
          <Route path="/the-wandering-lullaby" element={<WanderingLullaby />} />
          <Route
            path="/the-wandering-lullaby/iterations"
            element={<WanderingLullabyIterations />}
          />

          {/* Piece III — The Hidden Heart */}
          <Route path="/the-hidden-heart" element={<TheHiddenHeart />} />
          <Route
            path="/the-hidden-heart/iterations"
            element={<TheHiddenHeartIterations />}
          />

          {/* Speedrun-access flow (unchanged) */}
          <Route path="/access" element={<Access />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/app" element={<Workspace />} />

          {/* Legacy URL redirects — pre-catalog single-piece structure */}
          <Route
            path="/how-it-was-made"
            element={<Navigate to="/the-living-engine/iterations" replace />}
          />
          <Route
            path="/verdict"
            element={<Navigate to="/the-living-engine/verdict" replace />}
          />

          {/* Legacy /showcase/* paths — predate the catalog */}
          <Route path="/showcase" element={<Navigate to="/the-living-engine" replace />} />
          <Route
            path="/showcase/how-it-was-made"
            element={<Navigate to="/the-living-engine/iterations" replace />}
          />
          <Route
            path="/showcase/verdict"
            element={<Navigate to="/the-living-engine/verdict" replace />}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
