# Plan check: ep02-scene-s04-blend
brief-sha256: 70d88d13f2891b2d30378d66d68ac8c88736792ca712b3953c414504a97386e3

Blend test between s04 mid (owner: too cartoonish) and old s04 (owner: too realistic/AI). Reviewed by free legs (nvidia glm, groq qwen, openrouter nemotron, cohere; minimax timeout, gemini + mistral 429, omniroute safety label only). Applied:
- Richness vs muted materials contradiction: extra richness now lives in the lantern pool and deeper shadow values; material colours stay muted below old saturation.
- Shadow colour per material: shadow steps are darker cooler versions of each object's own colour.
- Ring geometry: two rings concentric around the spot under the lantern, three visible tones.
- Old-ref contamination: grain or soft glow in the result counts as leak from the mood ref -> redo.
- Brow placement: two short lines just above the dot eyes.
- Moonbeam perspective: slanting flat shape from hatch along the ladder (was "parallelogram").
Rejected: no numeric blend metric (main session judges side by side; chroma measured after); prop count too high (same list produced approved s04 mid); resolution limits (same wording on all merged mids); manifest missing (manifest written and committed with brief); crew-sheet variant (design spelled out in Characters); scale with no standing figure (scale block gives crouch = half standing).
Main session re-read revised brief: consistent, single output file, gate matches manifest, protected list covers approved mids and old s04.

VERDICT: PASS
