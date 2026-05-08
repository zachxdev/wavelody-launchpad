import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Access from "./pages/Access.tsx";
import AuthSuccess from "./pages/AuthSuccess.tsx";
import Workspace from "./pages/Workspace.tsx";
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
          <Route path="/access" element={<Access />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/app" element={<Workspace />} />
          <Route path="/how-it-was-made" element={<HowItWasMade />} />
          <Route path="/verdict" element={<Verdict />} />
          {/* Legacy /showcase/* paths — redirect to the new locations */}
          <Route path="/showcase" element={<Navigate to="/" replace />} />
          <Route
            path="/showcase/how-it-was-made"
            element={<Navigate to="/how-it-was-made" replace />}
          />
          <Route
            path="/showcase/verdict"
            element={<Navigate to="/verdict" replace />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
