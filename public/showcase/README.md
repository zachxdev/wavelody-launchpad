# Showcase audio

These eight mp3s back the "The Living Engine" showcase pages
(`/showcase` and `/showcase/how-it-was-made`).

They are NOT committed — total weight is ~70 MB and they belong to the
MusicDSL repo, not this one. `public/showcase/*.mp3` is gitignored.

## Repopulate after a fresh checkout

From a PowerShell prompt:

```powershell
$src = "D:\GitHub\MusicDSL"
$dst = "D:\GitHub\wavelody-launchpad\public\showcase"
New-Item -ItemType Directory -Force $dst | Out-Null

$map = @{
  "smoke-master-v1-piano-pattern.mp3"                          = "v1.mp3"
  "smoke-master-v7-piano-ravel-suite.mp3"                      = "v7.mp3"
  "smoke-master-v8-piano-ravel-suite-revised.mp3"              = "v8.mp3"
  "smoke-master-v9-piano-ravel-suite-melted-clock.mp3"         = "v9.mp3"
  "smoke-master-v10-piano-ravel-suite-friction.mp3"            = "v10.mp3"
  "smoke-master-v11-piano-ravel-suite-crystallization.mp3"     = "v11.mp3"
  "smoke-master-v12-piano-ravel-suite-acoustic-bridge.mp3"     = "v12.mp3"
  "smoke-master-v13-piano-ravel-suite-living-engine.mp3"       = "v13.mp3"
}
foreach ($k in $map.Keys) {
  Copy-Item "$src\$k" "$dst\$($map[$k])" -Force
}
```

Or on bash / WSL:

```bash
SRC=/mnt/d/GitHub/MusicDSL
DST=/mnt/d/GitHub/wavelody-launchpad/public/showcase
mkdir -p "$DST"
cp "$SRC/smoke-master-v1-piano-pattern.mp3"                      "$DST/v1.mp3"
cp "$SRC/smoke-master-v7-piano-ravel-suite.mp3"                  "$DST/v7.mp3"
cp "$SRC/smoke-master-v8-piano-ravel-suite-revised.mp3"          "$DST/v8.mp3"
cp "$SRC/smoke-master-v9-piano-ravel-suite-melted-clock.mp3"     "$DST/v9.mp3"
cp "$SRC/smoke-master-v10-piano-ravel-suite-friction.mp3"        "$DST/v10.mp3"
cp "$SRC/smoke-master-v11-piano-ravel-suite-crystallization.mp3" "$DST/v11.mp3"
cp "$SRC/smoke-master-v12-piano-ravel-suite-acoustic-bridge.mp3" "$DST/v12.mp3"
cp "$SRC/smoke-master-v13-piano-ravel-suite-living-engine.mp3"   "$DST/v13.mp3"
```

Vite will then serve them at `/showcase/v1.mp3` … `/showcase/v13.mp3`.
