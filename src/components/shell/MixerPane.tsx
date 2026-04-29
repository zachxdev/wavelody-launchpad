import { Slider } from "@/components/ui/slider";
import MixerRow, { MixerChannel } from "@/components/shell/MixerRow";

interface MixerPaneProps {
  channels: MixerChannel[];
  onChannelChange: (index: number, next: MixerChannel) => void;
  master: number;
  onMasterChange: (value: number) => void;
}

const MixerPane = ({ channels, onChannelChange, master, onMasterChange }: MixerPaneProps) => {
  return (
    <aside className="flex w-[200px] shrink-0 flex-col border-l border-border/60 bg-background">
      <div className="px-4 py-3">
        <span className="font-serif-display text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Mixer
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {channels.map((channel, idx) => (
          <div key={channel.name} className="border-t border-border/40 first:border-t-0">
            <MixerRow channel={channel} onChange={(next) => onChannelChange(idx, next)} />
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 px-3 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-serif-display text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Master
          </span>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground/70">
            {master.toFixed(2)}
          </span>
        </div>
        <Slider
          value={[master]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={(v) => onMasterChange(v[0] ?? master)}
          aria-label="Master gain"
          className="[&_[data-orientation=horizontal]>span]:h-1 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
        />
      </div>
    </aside>
  );
};

export default MixerPane;
