import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/shell/TopBar";
import PassesPane from "@/components/shell/PassesPane";
import ScoreToolbar, { ScoreView } from "@/components/shell/ScoreToolbar";
import MixerPane from "@/components/shell/MixerPane";
import { MixerChannel } from "@/components/shell/MixerRow";
import PromptDock from "@/components/shell/PromptDock";
import { Pass } from "@/components/shell/PassCard";

const INITIAL_PASSES: Pass[] = [
  {
    id: "chord-skeleton",
    title: "Chord Skeleton",
    voices: ["Piano LH", "Piano RH"],
    status: "ready",
  },
  { id: "bass-line", title: "Bass Line", voices: ["Bass"], status: "ready" },
  { id: "drums", title: "Drums", voices: ["Drums"], status: "ready" },
  { id: "melody", title: "Melody", voices: ["Piano RH"], status: "ready" },
];

const INITIAL_CHANNELS: MixerChannel[] = [
  { name: "Piano", gain: 0.8, pan: 0, muted: false, soloed: false },
  { name: "Bass", gain: 0.8, pan: 0, muted: false, soloed: false },
  { name: "Drums", gain: 0.8, pan: 0, muted: false, soloed: false },
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

  useEffect(() => {
    const session = sessionStorage.getItem("wavelody-session");
    if (!session) {
      navigate("/", { replace: true });
      return;
    }
    setAuthChecked(true);
  }, [navigate]);

  if (!authChecked) return null;

  const handleChannelChange = (index: number, next: MixerChannel) => {
    setChannels((prev) => prev.map((c, i) => (i === index ? next : c)));
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      <TopBar />

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
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onStop={() => setIsPlaying(false)}
            position="1:1.000"
            bar={1}
            totalBars={8}
          />
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center">
              <p className="font-serif-display text-xl tracking-tight text-muted-foreground">
                Score editor mounts here.
              </p>
              <p className="mt-2 text-sm text-muted-foreground/60">
                Piano Roll and MDSL Grid views — Phase 4 and 5.
              </p>
            </div>
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
