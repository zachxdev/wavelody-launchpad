import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import AuthSuccess from "./pages/AuthSuccess.tsx";
import Workspace from "./pages/Workspace.tsx";
import Showcase from "./pages/Showcase.tsx";
import HowItWasMade from "./pages/HowItWasMade.tsx";
import Verdict from "./pages/Verdict.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/app" element={<Workspace />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/showcase/how-it-was-made" element={<HowItWasMade />} />
          <Route path="/showcase/verdict" element={<Verdict />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
