import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

type Props = {
  src: string;
  /** Visible label, e.g. "v13 — The Living Engine" */
  label?: string;
  /** Visible duration string, e.g. "6:06" */
  durationHint?: string;
  /** Larger styling for hero placement. */
  variant?: "default" | "hero";
  /** Coordinate playback so only one player is active at a time. */
  groupKey?: string;
};

// Single-active-player coordinator. Each player joins a group by its groupKey
// (defaults to "showcase"); when one starts, all others in the group pause.
type Stopper = () => void;
const groupRegistry = new Map<string, Set<Stopper>>();
function registerStopper(group: string, stop: Stopper): () => void {
  if (!groupRegistry.has(group)) groupRegistry.set(group, new Set());
  groupRegistry.get(group)!.add(stop);
  return () => {
    groupRegistry.get(group)?.delete(stop);
  };
}
function pauseGroupExcept(group: string, except: Stopper) {
  const set = groupRegistry.get(group);
  if (!set) return;
  set.forEach((s) => {
    if (s !== except) s();
  });
}

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
};

const AudioPlayer = ({
  src,
  label,
  durationHint,
  variant = "default",
  groupKey = "showcase",
}: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const stop = () => {
      el.pause();
    };
    const unregister = registerStopper(groupKey, stop);
    return () => {
      unregister();
    };
  }, [groupKey]);

  const onPlayPauseClick = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      pauseGroupExcept(groupKey, () => el.pause());
      void el.play();
    } else {
      el.pause();
    }
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Number(e.target.value);
  };

  const isHero = variant === "hero";

  return (
    <div
      className={
        isHero
          ? "rounded-xl border border-border/60 bg-card/80 p-5 shadow-[0_0_60px_-30px_hsl(173_80%_40%/0.6)] backdrop-blur"
          : "rounded-lg border border-border/60 bg-card/60 p-3"
      }
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPlayPauseClick}
          aria-label={isPlaying ? "Pause" : "Play"}
          className={
            isHero
              ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors hover:bg-primary/25"
          }
        >
          {isPlaying ? (
            <Pause className={isHero ? "h-5 w-5" : "h-4 w-4"} />
          ) : (
            <Play
              className={
                isHero
                  ? "h-5 w-5 translate-x-[1px] fill-primary-foreground"
                  : "h-4 w-4 translate-x-[1px] fill-primary"
              }
            />
          )}
        </button>

        <div className="min-w-0 flex-1">
          {label && (
            <div
              className={
                isHero
                  ? "truncate font-serif-display text-base text-foreground"
                  : "truncate text-sm text-foreground"
              }
            >
              {label}
            </div>
          )}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={onSeek}
              aria-label="Seek"
              className="h-1 w-full appearance-none rounded-full bg-muted accent-primary [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {fmt(currentTime)} / {durationHint ?? fmt(duration)}
            </span>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </div>
  );
};

export default AudioPlayer;
