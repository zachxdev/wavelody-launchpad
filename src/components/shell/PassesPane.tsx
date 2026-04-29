import PassCard, { Pass } from "@/components/shell/PassCard";

interface PassesPaneProps {
  passes: Pass[];
  selectedPassId: string;
  onSelectPass: (id: string) => void;
  onRerunPass: (id: string) => void;
}

const PassesPane = ({ passes, selectedPassId, onSelectPass, onRerunPass }: PassesPaneProps) => {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border/60 bg-background">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-serif-display text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Passes
        </span>
        <span className="text-xs text-muted-foreground/60">{passes.length}</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
        {passes.map((pass) => (
          <PassCard
            key={pass.id}
            pass={pass}
            selected={pass.id === selectedPassId}
            onSelect={() => onSelectPass(pass.id)}
            onRerun={() => onRerunPass(pass.id)}
          />
        ))}
      </div>
    </aside>
  );
};

export default PassesPane;
