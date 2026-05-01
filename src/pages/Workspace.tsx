import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/shell/TopBar";
import PassesPane from "@/components/shell/PassesPane";
import ScoreToolbar, {
  ScoreView,
  type AudioStatus,
} from "@/components/shell/ScoreToolbar";
import MixerPane from "@/components/shell/MixerPane";
import { MixerChannel } from "@/components/shell/MixerRow";
import PromptDock, {
  type EditScope,
  type PromptDockStatus,
} from "@/components/shell/PromptDock";
import CritiquePanel from "@/components/shell/CritiquePanel";
import { Pass } from "@/components/shell/PassCard";
import PianoRoll from "@/components/editor/PianoRoll";
import MdslGrid from "@/components/editor/MdslGrid";
import { NO_SELECTION, type Selection } from "@/components/editor/selection";
import {
  parse,
  serialize,
  mergeEditSlice,
  type Score,
} from "@/lib/musicdsl";
import {
  Transport,
  loadStemsFromRender,
  synthesizeStemsForScore,
} from "@/lib/audio";
import { clearSession, getSession } from "@/lib/auth/client";
import {
  ApiError,
  postCritique,
  postEdit,
  postGenerate,
  postRender,
} from "@/lib/api";
import type { CritiqueSuggestion, EnsembleTemplate } from "../../api/types";

const FIXTURE_URL = "/fixtures/piano_trio.mdsl";
const ACTIVE_TEMPLATE: EnsembleTemplate = "piano_trio";

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

interface CritiqueState {
  status: "idle" | "loading" | "ready" | "error";
  suggestions: CritiqueSuggestion[];
  errorMessage?: string;
}

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
  const [promptStatus, setPromptStatus] = useState<PromptDockStatus>({
    kind: "idle",
  });

  const [score, setScore] = useState<Score | null>(null);
  const [selection, setSelection] = useState<Selection>(NO_SELECTION);
  const [currentBeat, setCurrentBeat] = useState(0);
  const transportRef = useRef<Transport | null>(null);
  const [voicesReady, setVoicesReady] = useState(false);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("idle");

  // Tracking the most recent rendered master URL so /api/critique can run
  // against the audio the user is actually hearing.
  const lastMasterUrlRef = useRef<string | null>(null);
  const lastPromptRef = useRef<string>("");

  const [critique, setCritique] = useState<CritiqueState>({
    status: "idle",
    suggestions: [],
  });

  useEffect(() => {
    const session = getSession();
    if (!session) {
      clearSession();
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

    setAudioStatus("loading");
    let cancelled = false;
    synthesizeStemsForScore(score)
      .then((stems) => transport.load(stems))
      .then(() => {
        if (cancelled) return;
        setVoicesReady(true);
        setAudioStatus("ready");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        console.error("Failed to synthesize stems", e);
        setAudioStatus("error");
      });

    return () => {
      cancelled = true;
      offTick();
      offPlay();
      offPause();
      offStop();
      transport.dispose();
      transportRef.current = null;
      setVoicesReady(false);
      setAudioStatus("idle");
    };
  }, [score]);

  useEffect(() => {
    const t = transportRef.current;
    if (!t) return;
    t.setMasterGain(master);
  }, [master, voicesReady]);

  useEffect(() => {
    const t = transportRef.current;
    if (!t) return;
    for (const ch of channels) {
      t.setVoiceGain(ch.name, ch.gain);
      t.setVoiceMuted(ch.name, ch.muted);
      t.setVoiceSolo(ch.name, ch.soloed);
    }
  }, [channels, voicesReady]);

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

  // ---------- Selection → edit scope ----------
  const editScope: EditScope | null =
    selection.kind === "range" && selection.voice
      ? {
          voice: selection.voice,
          startBar: selection.startBar,
          endBar: selection.endBar,
        }
      : null;

  const clearScope = () => setSelection(NO_SELECTION);

  // ---------- Generate / edit / render / critique pipeline ----------

  const renderAndLoad = async (
    targetScore: Score,
    voicesToRender?: string[],
  ): Promise<string | null> => {
    setPromptStatus({ kind: "rendering" });
    try {
      const renderResp = await postRender({
        musicdsl: serialize(targetScore),
        template: ACTIVE_TEMPLATE,
        voices_to_render: voicesToRender,
      });
      lastMasterUrlRef.current = renderResp.master_url;
      const t = transportRef.current;
      if (t) {
        const { stems, failed } = await loadStemsFromRender(renderResp.stems);
        if (failed.length > 0) {
          // Fill missing voices with synthesised placeholders so playback
          // never silently drops a voice — better to hear a sine than
          // nothing.
          const synth = await synthesizeStemsForScore(targetScore);
          for (const v of failed) {
            const placeholder = synth.get(v);
            if (placeholder) stems.set(v, placeholder);
          }
        }
        await t.load(stems);
      }
      return renderResp.master_url;
    } catch (e: unknown) {
      console.error("Render failed", e);
      // Fall back to synthesised stems so the user still has something to
      // hear. Critique will not run without a real WAV URL.
      const t = transportRef.current;
      if (t) {
        const synth = await synthesizeStemsForScore(targetScore);
        await t.load(synth);
      }
      return null;
    }
  };

  const runCritique = async (
    targetScore: Score,
    masterUrl: string,
    originalPrompt: string,
  ): Promise<void> => {
    setCritique({ status: "loading", suggestions: [] });
    try {
      const result = await postCritique({
        musicdsl: serialize(targetScore),
        master_wav_url: masterUrl,
        original_prompt: originalPrompt,
      });
      setCritique({ status: "ready", suggestions: result.suggestions });
    } catch (e: unknown) {
      const message =
        e instanceof ApiError ? e.body.error : (e as Error).message;
      setCritique({ status: "error", suggestions: [], errorMessage: message });
    }
  };

  const handleGenerate = async (): Promise<void> => {
    const trimmed = promptText.trim();
    if (trimmed.length === 0) return;
    lastPromptRef.current = trimmed;
    setPromptStatus({ kind: "composing", attempt: 1, preview: "" });
    setCritique({ status: "idle", suggestions: [] });
    try {
      const result = await postGenerate(
        { prompt: trimmed, template: ACTIVE_TEMPLATE },
        {
          onAttempt: (attempt) =>
            setPromptStatus({ kind: "composing", attempt, preview: "" }),
          onChunk: (chunk) =>
            setPromptStatus((prev) => {
              if (prev.kind !== "composing") return prev;
              return {
                kind: "composing",
                attempt: prev.attempt,
                preview: (prev.preview + chunk).slice(-80),
              };
            }),
        },
      );
      const newScore = parse(result.musicdsl);
      setScore(newScore);
      setSelection(NO_SELECTION);
      const masterUrl = await renderAndLoad(newScore);
      setPromptStatus({ kind: "idle" });
      if (masterUrl) {
        void runCritique(newScore, masterUrl, trimmed);
      }
    } catch (e: unknown) {
      const message =
        e instanceof ApiError ? e.body.error : (e as Error).message;
      setPromptStatus({ kind: "error", message });
    }
  };

  const handleEdit = async (scope: EditScope): Promise<void> => {
    if (!score) return;
    const trimmed = promptText.trim();
    if (trimmed.length === 0) return;
    setPromptStatus({ kind: "editing" });
    setCritique({ status: "idle", suggestions: [] });
    try {
      const sliceResp = await postEdit({
        voice_id: scope.voice,
        bar_start: scope.startBar,
        bar_end: scope.endBar,
        edit_prompt: trimmed,
        current_score: serialize(score),
      });
      const sliceScore = parse(sliceResp.slice);
      const merged = mergeEditSlice(score, sliceScore, scope.voice);
      setScore(merged);
      const masterUrl = await renderAndLoad(merged, [scope.voice]);
      setPromptStatus({ kind: "idle" });
      if (masterUrl) {
        void runCritique(merged, masterUrl, lastPromptRef.current || trimmed);
      }
    } catch (e: unknown) {
      const message =
        e instanceof ApiError ? e.body.error : (e as Error).message;
      setPromptStatus({ kind: "error", message });
    }
  };

  const onSubmitDock = () => {
    if (editScope) {
      void handleEdit(editScope);
    } else {
      void handleGenerate();
    }
  };

  const projectName = score?.header.title ?? "Loading…";
  const tempo = score?.header.tempo ?? 120;
  const keyName = score?.header.key ?? "—";
  const timeSig = score
    ? `${score.header.timeSignature.numerator}/${score.header.timeSignature.denominator}`
    : "—";
  const beatsPerBar = score?.header.timeSignature.numerator ?? 4;
  const totalBars = score?.bars.length ?? 1;
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
            audioStatus={audioStatus}
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

      <CritiquePanel
        status={critique.status}
        suggestions={critique.suggestions}
        errorMessage={critique.errorMessage}
      />

      <PromptDock
        open={dockOpen}
        onToggle={() => setDockOpen((o) => !o)}
        value={promptText}
        onChange={setPromptText}
        onSubmit={onSubmitDock}
        editScope={editScope}
        onClearScope={clearScope}
        status={promptStatus}
      />
    </div>
  );
};

export default Workspace;
