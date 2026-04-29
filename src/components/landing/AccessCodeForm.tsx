import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const AccessCodeForm = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter a code.");
      return;
    }

    setSubmitting(true);
    try {
      // Mock: any non-empty code returns 200. Real endpoint can replace this.
      try {
        await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: trimmed }),
        });
      } catch {
        // Network failure during private preview is non-fatal for the mock.
      }
      navigate("/auth-success");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-[480px] border-border/60 bg-card p-8 shadow-2xl shadow-black/40">
      <div className="space-y-2 text-center">
        <h2 className="font-serif-display text-2xl tracking-tight">Enter your access code.</h2>
        <p className="text-sm text-muted-foreground">
          The demo is gated to manage GPU compute costs while in private preview.
          Each code unlocks 20 generations and 60 scoped edits.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-3" noValidate>
        <Input
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="speedrun-2026"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (error) setError(null);
          }}
          aria-label="Access code"
          aria-invalid={!!error}
          aria-describedby={error ? "code-error" : undefined}
          className="h-11 bg-background/60"
        />
        {error && (
          <p id="code-error" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="h-11 w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entering…
            </>
          ) : (
            "Enter demo"
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Don't have a code?{" "}
        <a
          href="mailto:access@wavelody.com"
          className="text-primary underline-offset-4 hover:underline"
        >
          Request access
        </a>
      </p>
    </Card>
  );
};

export default AccessCodeForm;
