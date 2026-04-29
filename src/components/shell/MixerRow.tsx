import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export interface MixerChannel {
  name: string;
  gain: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
}

interface MixerRowProps {
  channel: MixerChannel;
  onChange: (next: MixerChannel) => void;
}

const MixerRow = ({ channel, onChange }: MixerRowProps) => {
  return (
    <div className="space-y-2 px-3 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-foreground">{channel.name}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange({ ...channel, muted: !channel.muted })}
            aria-pressed={channel.muted}
            aria-label={`Mute ${channel.name}`}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded text-[10px] font-medium transition-colors",
              channel.muted
                ? "bg-destructive/80 text-destructive-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            M
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...channel, soloed: !channel.soloed })}
            aria-pressed={channel.soloed}
            aria-label={`Solo ${channel.name}`}
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded text-[10px] font-medium transition-colors",
              channel.soloed
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            S
          </button>
        </div>
      </div>
      <Slider
        value={[channel.gain]}
        min={0}
        max={1}
        step={0.01}
        onValueChange={(v) => onChange({ ...channel, gain: v[0] ?? channel.gain })}
        aria-label={`${channel.name} gain`}
        className="[&_[data-orientation=horizontal]>span]:h-1 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
      />
      <Slider
        value={[channel.pan]}
        min={-1}
        max={1}
        step={0.01}
        onValueChange={(v) => onChange({ ...channel, pan: v[0] ?? channel.pan })}
        aria-label={`${channel.name} pan`}
        className="[&_[data-orientation=horizontal]>span]:h-0.5 [&_[role=slider]]:h-2.5 [&_[role=slider]]:w-2.5"
      />
    </div>
  );
};

export default MixerRow;
