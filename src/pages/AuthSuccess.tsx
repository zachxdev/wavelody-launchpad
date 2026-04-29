import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const t = window.setTimeout(() => navigate("/app", { replace: true }), 800);
    return () => window.clearTimeout(t);
  }, [navigate]);

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Loading workspace…</p>
      </div>
    </main>
  );
};

export default AuthSuccess;
