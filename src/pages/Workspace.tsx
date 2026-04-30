import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/shell/TopBar";
import PassesPane from "@/components/shell/PassesPane";
import ScoreToolbar, { ScoreView } from "@/components/shell/ScoreToolbar";
import MixerPane from "@/components/shell/MixerPane";
import { MixerChannel } from "@/components/shell/MixerRow";
import PromptDock from "@/components/shell/PromptDock";
import { Pass } from "@/components/shell/PassCard";
import PianoRoll from "@/components/editor/PianoRoll";
import MdslGrid from "@/components/editor/MdslGrid";
import { NO_SELECTION, type Selection } from "@/components/editor/selection";
import { parse, type Score } from "@/lib/musicdsl";
import { Transport, synthesizeStemsForScore } from "@/lib/audio";

const FIXTURE_URL = "/fixtures/piano_trio.mdsl";

const INITIAL_PASSES: Pass[] = [
  {
    id: "chord-skeleton",
    title: "Chord Skeleton",
    voices: ["LH", "RH"],
    status: "ready",
  },
  { id: "bass-line", title: "Bass Line", voices: ["Vc"], status: "ready" },
  { id: "strings", title: "Strings", voices: ["V", "Vc"], status: "ready" },
  { id: "melody", title: "Melody", voices: ["RH", "V"], status: "ready" },
];

const INITIAL_CHANNELS: MixerChannel[] = [
  { name: "LH", gain: 0.8, pan: 0, muted: false, soloed: false },
  { name: "RH", gain: 0.8, pan: 0, muted: false, soloed: false },
  { name: "V", gain: 0.8, pan: 0, muted: false, soloed: false },
  { name: "Vc", gain: 0.8, pan: 0, muted: false, soloed: false },
];

const Workspace = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  const [passes] = useState<Pass[]>(INITIAL_PASSES);
  const [selectedPassId, setSelectedPassId] = useState<string>(INITIAL_PASSES[0].id);

  const [view, setView] = useState<ScoreView>("piano-roll");
  const [isPlaying, setIsPlaying] = useState(false);

  const [channels, setChannels] = useState<MixerChannel[]>(INITIAL_CHANNELS);
  const [master, setMaster] = useState(0.9);

  const [dockOpen, setDockOpen] = useState(true);
  const [promptText, setPromptText] = useState("");

  const [score, setScore] = useState<Score | null>(null);
  const [selection, setSelection] = useState<Selection>(NO_SELECTION);
  const [currentBeat, setCurrentBeat] = useState(0);
  const transportRef = useRef<Transport | null>(null);

  useEffect(() => {
    const session = sessionStorage.getItem("wavelody-session");
    if (!session) {
      navigate("/", { replace: true });
      return;
    }
    setAuthChecked(true);
  }, [navigate]);

  useEffect(() => {
    if (!authChecked) return;
    let cancelled = false;
    fetch(FIXTURE_URL)
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        setScore(parse(text));
      })
      .catch((e: unknown) => {
        console.error("Failed to load fixture", e);
      });
    return () => {
      cancelled = true;
    };
  }, [authChecked]);

  // Build a Transport per loaded score; tear it down on unload / score swap.
  useEffect(() => {
    if (!score) return;
    const transport = new Transport();
    const beatsPerBar = score.header.timeSignature.numerator;
    transport.configure({
      bpm: score.header.tempo,
      beatsPerBar,
      totalBeats: score.bars.length * beatsPerBar,
    });
    transportRef.current = transport;

    const offTick = transport.on("beat-tick", setCurrentBeat);
    const offPlay = transport.on("play", () => setIsPlaying(true));
    const offPause = transport.on("pause", () => setIsPlaying(false));
    const offStop = transport.on("stop", () => {
      setIsPlaying(false);
      setCurrentBeat(0);
    });

    // Synthesize placeholder stems and load into the transport.
    // Real WAV stems via loader.ts will land here in Phase 8.
    synthesizeStemsForScore(score)
      .then((stems) => transport.load(stems))
      .catch((e: unknown) => {
        console.error("Failed to synthesize stems", e);
      });

    return () => {
      offTick();
      offPlay();
      offPause();
      offStop();
      transport.dispose();
      transportRef.current = null;
    };
  }, [score]);

  if (!authChecked) return null;

  const handleChannelChange = (index: number, next: MixerChannel) => {
    setChannels((prev) => prev.map((c, i) => (i === index ? next : c)));
  };

  const onTogglePlay = () => {
    const t = transportRef.current;
    if (!t) return;
    if (t.isPlaying()) t.pause();
    else void t.start();
  };

  const onStop = () => transportRef.current?.stop();

  const projectName = score?.header.title ?? "Loading…";
  const tempo = score?.header.tempo ?? 120;
  const keyName = score?.header.key ?? "—";
  const timeSig = score
    ? `${score.header.timeSignature.numerator}/${score.header.timeSignature.denominator}`
    : "—";
  const beatsPerBar = score?.header.timeSignature.numerator ?? 4;
  const totalBars = score?.bars.length ?? 1;
  // Clamp the displayed playhead to [0, totalBars*beatsPerBar - epsilon] so
  // overshoot past the end of the rendered audio doesn't show e.g. "Bar 33".
  // (Auto-stop at end is a separate concern; tracked for a follow-up.)
  const maxBeat = totalBars * beatsPerBar - 1e-6;
  const clampedBeat = Math.max(0, Math.min(currentBeat, maxBeat));
  const currentBar = Math.floor(clampedBeat / beatsPerBar) + 1;
  const beatInBar = clampedBeat - (currentBar - 1) * beatsPerBar + 1;
  const beatInt = Math.floor(beatInBar);
  const beatFrac = Math.max(0, beatInBar - beatInt);
  const positionStr = `${currentBar}:${beatInt}.${Math.floor(beatFrac * 1000)
    .toString()
    .padStart(3, "0")}`;

  const onSeek = (beat: number) => {
    const t = transportRef.current;
    if (!t) return;
    const clamped = Math.max(0, Math.min(beat, totalBars * beatsPerBar));
    t.seek(clamped);
  };

  // Map playhead to an MdslGrid row location: 0-based row index inside the
  // current bar. Resolution comes from the corresponding bar so mid-piece
  // <RESOLUTION:N> overrides will Just Work once we tighten that path.
  const gridPlayhead = (() => {
    if (!score) return undefined;
    const bar = score.bars.find((b) => b.index === currentBar);
    if (!bar) return undefined;
    const rowsPerBeat = bar.resolution / bar.timeSignature.numerator;
    const beatInBarZero = Math.max(0, clampedBeat - (currentBar - 1) * beatsPerBar);
    const rowIndex = Math.min(
      bar.rows.length - 1,
      Math.floor(beatInBarZero * rowsPerBeat),
    );
    return { bar: currentBar, rowIndex };
  })();

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar
        projectName={projectName}
        tempo={tempo}
        keyName={keyName}
        timeSignature={timeSig}
      />

      <div className="flex flex-1 min-h-0">
        <PassesPane
          passes={passes}
          selectedPassId={selectedPassId}
          onSelectPass={setSelectedPassId}
          onRerunPass={() => {
            /* no-op */
          }}
        />

        <main className="flex flex-1 flex-col min-w-0">
          <ScoreToolbar
            view={view}
            onViewChange={setView}
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            onStop={onStop}
            position={positionStr}
            bar={currentBar}
            totalBars={totalBars}
          />
          <div className="relative flex-1 min-h-0">
            {score ? (
              view === "piano-roll" ? (
                <PianoRoll
                  score={score}
                  playhead={clampedBeat}
                  selection={selection}
                  onSelectionChange={setSelection}
                  onSeek={onSeek}
                />
              ) : (
                <MdslGrid
                  score={score}
                  selection={selection}
                  onSelectionChange={setSelection}
                  playhead={gridPlayhead}
                  onSeek={onSeek}
                />
              )
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground/60">Loading score…</p>
              </div>
            )}
          </div>
        </main>

        <MixerPane
          channels={channels}
          onChannelChange={handleChannelChange}
          master={master}
          onMasterChange={setMaster}
        />
      </div>

      <PromptDock
        open={dockOpen}
        onToggle={() => setDockOpen((o) => !o)}
        value={promptText}
        onChange={setPromptText}
        onGenerate={() => {
          /* no-op */
        }}
      />
    </div>
  );
};

export default Workspace;
