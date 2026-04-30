import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { AuthError, postAuth } from "@/lib/auth/client";

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
      await postAuth(trimmed);
      navigate("/auth-success");
    } catch (err: unknown) {
      setError(messageFor(err));
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

function messageFor(err: unknown): string {
  if (err instanceof AuthError) {
    if (err.status === 429) {
      return "All codes for this tier are at quota. Email access@wavelody.com for more.";
    }
    if (err.status >= 500) {
      return "Auth service unavailable, please try again in a moment.";
    }
    return err.message || "Code not recognized.";
  }
  if (err instanceof TypeError) {
    return "Network error. Check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

export default AccessCodeForm;
