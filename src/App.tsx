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
import TheHiddenHeartClassical from "./pages/TheHiddenHeartClassical.tsx";
import TheHiddenHeartModernAsian from "./pages/TheHiddenHeartModernAsian.tsx";
import TheHiddenHeartEastern from "./pages/TheHiddenHeartEastern.tsx";
import SkyCombat from "./pages/SkyCombat.tsx";
import SkyCombatIterations from "./pages/SkyCombatIterations.tsx";
import SkyCombatSymphonic from "./pages/SkyCombatSymphonic.tsx";
import ModalWind from "./pages/ModalWind.tsx";
import ModalWindJazzHipHop from "./pages/ModalWindJazzHipHop.tsx";
import KpopThreeFourStyle from "./pages/KpopThreeFourStyle.tsx";
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
          <Route
            path="/the-hidden-heart/classical-orchestra"
            element={<TheHiddenHeartClassical />}
          />
          <Route
            path="/the-hidden-heart/modern-asian-orchestra"
            element={<TheHiddenHeartModernAsian />}
          />
          <Route
            path="/the-hidden-heart/eastern-orchestra"
            element={<TheHiddenHeartEastern />}
          />

          {/* Piece IV — Sky Combat */}
          <Route path="/sky-combat" element={<SkyCombat />} />
          <Route
            path="/sky-combat/iterations"
            element={<SkyCombatIterations />}
          />
          <Route
            path="/sky-combat/symphonic"
            element={<SkyCombatSymphonic />}
          />

          {/* Piece V — Colors of the Modal Wind (constraint-prompted ballad) */}
          <Route path="/the-modal-wind" element={<ModalWind />} />

          {/* Piece VI — Colors of the Modal Wind (jazz hip-hop arrangement) */}
          <Route
            path="/the-modal-wind-jazz-hiphop"
            element={<ModalWindJazzHipHop />}
          />

          {/* Piece VII — 3!4! Style (K-pop, decomposed style template) */}
          <Route path="/three-four-style" element={<KpopThreeFourStyle />} />

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
