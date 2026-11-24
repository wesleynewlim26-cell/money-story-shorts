---
name: money-story-vertical
description: Build and verify 720x1280 Remotion money-story videos
version: 1.0.0
author: User (Hermes, Termux)
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags: [Remotion, Video, Vertical, 9:16, Verification]
    related_skills: [remotion-best-practices, remotion-render, remotion-video]
    requires_toolsets: [terminal]
---

# Money-Story Vertical Video (Remotion, 720x1280, 30fps)

Build a 60-second, 14-scene, faceless cartoon money-story video
(Victor Lustig selling the Eiffel Tower, Paper Billions style)
with Remotion, rendered ONLY via GitHub Actions. Verify every scene
as a still frame before any full render. Never claim success without
frame evidence.

## When to Use

Use when the user asks to create, fix, or re-render this vertical
money-story video, or any scene, subtitle, character, or layout in it.
Load this skill BEFORE writing or editing any Remotion code.
Also load `/remotion-best-practices` and `/remotion-render` when
available; this skill wins on any conflict about layout or verification.

## Hard bans — never do these

- NEVER render in Termux. Termux has no Chrome Headless Shell and no
  Docker; browser bootstrap is skipped there. Render ONLY via the
  GitHub Actions workflow `.github/workflows/render.yml`.
- NEVER use `<HtmlInCanvas>`, Canvas 2D `useEffect` drawing,
  `ctx.translate/scale`, vignette radial gradients, or film-grain
  overlays. They caused black frames. All scenes are declarative
  div/SVG only. If a vignette is ever wanted, use
  `@remotion/effects` `vignette()` with a small amount — never a
  hand-drawn black gradient covering the frame.
- NEVER use `Math.random()`, `Date.now()`, `setState`, timers, or
  `requestAnimationFrame` for animation. Every frame is a pure
  function of `useCurrentFrame()`; animate only with `interpolate`
  (always `extrapolate: 'clamp'`) or `spring()`.
- NEVER use `whiteSpace: 'nowrap'` on any text. NEVER place text at
  `top: 0`, `bottom: 0`, `left: 0`, or `right: 0` without padding.
- NEVER say "done / good / fixed" without listing the frame numbers
  and file paths you inspected.

## Composition contract (do not change without asking)

- `width: 720`, `height: 1280`, `fps: 30`, 60 seconds, 14 scenes.
  Single source of truth: `src/Root.tsx` + `src/Composition.tsx`.
- One variable per fix. If a still looks wrong, change ONE thing,
  re-render that still, re-inspect, then move on.

## Layout rules — full-bleed, no clipping, no overlap

1. **Full-bleed.** Every scene root is
   `<AbsoluteFill style={{backgroundColor: <solid or gradient>}}>`
   as layer 0. No fixed-size centred box. No outer margin that leaves
   dark empty background. If a still shows >10% empty dark area,
   the scene FAILS.
2. **Three layers minimum per scene:** (a) full sky/wall gradient,
   (b) one LARGE hero element (Eiffel Tower / ship >= 60% of frame
   height), (c) ground/floor + at least 2 props (clouds, windows,
   lamps, crowd, trees). An empty background FAILS.
3. **Safe area (9:16).** Keep all critical text and faces inside the
   middle 75% vertically. Text padding: left/right >= 48px,
   subtitle box `bottom: 120px` (never 0). No text may touch any edge.
4. **Text.** `flexWrap: 'wrap'`, `overflowWrap: 'break-word'`,
   `maxWidth: '100%'`, `textAlign: 'center'`, explicit `lineHeight`.
   Title <= 60px, subtitle <= 34px at 720 width. Max 2 lines; if the
   longest line would exceed 2 lines, shrink the font or split the
   line — never let it overflow. Use `@remotion/google-fonts` so the
   headless render matches (system fonts may be missing on the runner).
5. **Characters.** One character per flex slot; character height
   >= 35% of frame height (>= 450px at 1280). Size from
   `useVideoConfig()` proportions, never hard-coded numbers copied
   from a 16:9 example. No two characters may overlap; check the
   mid-frame still of every scene for overlap.
6. **Split-screen.** Flex row 50/50, each panel `overflow: 'hidden'`
   with its own padding. Nothing may be cut off at the right edge —
   check the POLISI scene still explicitly.
7. **Backgrounds.** Solid colour or gradient only on layer 0. No
   black overlay above 10% opacity over the whole frame.

## Procedure

1. **Plan (no code yet).** Write/confirm `data/scenes.json`: 14 scenes,
   each with id, start/end frame, narration text, subtitle text
   (<= 2 lines), hero element, background, characters.
2. **Code one scene at a time**, declarative div/SVG + `<Sequence>` /
   `<Series>` per scene. Run `npm run build` (or `npx tsc --noEmit`)
   — a passing build is NOT visual proof.
3. **Stills first (mandatory).** In GitHub Actions (or via the
   stills job), render ONE mid-frame still per scene:
   `npx remotion still MoneyStory out/stills/scene-NN.png --frame=<mid> --props=./data/props.json --overwrite`
   Or all at once: `npx remotion render MoneyStory out/frames --frames=<comma-list> --image-format=png`
   Use the SAME props that will ship, not just defaultProps.
4. **Contact sheet.** Tile the 14 stills into one sheet
   (ImageMagick `montage` or the `contact-sheet` helper from the
   remotion-video skill) and download it with `gh run download`.
5. **Inspect every still** against this checklist (write PASS/FAIL
   per scene, with frame number + path):
   - [ ] Frame is not black: mean brightness > 30 (check with
     Python PIL: `Image.open(p).convert('L')` mean).
   - [ ] Background fills the whole 720x1280 frame.
   - [ ] No text clipped at any edge; subtitle fully readable.
   - [ ] No characters overlapping; characters large enough.
   - [ ] Hero element (Tower/ship) large, not a tiny icon.
   - [ ] Split-screen panels fully inside the frame.
   Fix FAILs one variable at a time; go back to step 3.
6. **Full render ONLY after all 14 stills PASS:**
   `npx remotion render MoneyStory out/video.mp4 --props=./data/props.json`
   via GitHub Actions; download the artifact.
7. **Verify the encode:** `ffprobe out/video.mp4` must report
   720x1280, 30fps, ~60s. Extract 3 frames with ffmpeg
   (`ffmpeg -v error -ss 1.5 -i out/video.mp4 -frames:v 1 check_1.png`)
   and inspect them. Only then report completion, listing the
   artifact path, frame paths, and ffprobe output.

## Pitfalls (each cost a render before)

- Black frames: a full-frame black overlay (vignette/grain) or a
  Canvas that never painted. Fix by deleting the overlay/canvas,
  not by brightening it.
- Small centred rectangle + dark surround: scene box smaller than
  the 720x1280 composition, or a scale < 1. Fix the root
  `<AbsoluteFill>`, not the inner content.
- Text cut at edges: text placed at the frame edge or with
  `nowrap`. Fix with safe-area padding + wrapping (rule 3–4).
- Tiny Tower/ship: hero drawn in absolute px from a 16:9 example.
  Size it as a fraction of frame height (rule 2, 5).
- Stale-file false pass: always pass `--overwrite` and re-download
  the artifact; never inspect a previous run's PNG.
- "Yellow test frame worked for 1s": a single solid-colour frame
  proves the pipeline runs; it proves nothing about any scene.

## Verification

Done ONLY when: `npm run build` passes; all 14 mid-frame stills
PASS the checklist above (list them); `ffprobe` shows 720x1280 /
30fps / ~60s; 3 extracted MP4 frames inspected and PASS. Report
the evidence (paths + numbers). If any check cannot run, report
`NOT VERIFIED: <check> — blocked by <reason>` and stop; do not
guess and do not claim success.
