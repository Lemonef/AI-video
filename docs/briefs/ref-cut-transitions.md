---json
{"id":"ref-cut-transitions","type":"normal","risk":"low","repo":"D:/AI-video","gates":["if not exist node_modules mklink /J node_modules D:\\AI-video\\node_modules >nul","if not exist public\\reference-study mklink /J public\\reference-study D:\\AI-video\\public\\reference-study >nul","set PYTHONUTF8=1&& set REMOTION_OFFLINE_FONTS=1&& set REFERENCE_STUDY_DIR=D:\\AI-video\\out\\drafts\\reference-study\\DegJCmXtbGj&& python scripts/reference_gate.py --shots 8 9 23 28 31 32 --guard 20"],"protected":["scripts/**","out/**","public/**","package.json","package-lock.json","src/compositions/ReferenceStudy/shots.ts","src/compositions/ReferenceStudy/*.json","docs/**"],"context_files":["src/compositions/ReferenceStudy/index.tsx"]}
---
# Goal
Match the source's cut transitions (flash-to-white and fade-from-black at shot starts) in the `ReferenceAssisted` render. All numbers below were measured from the private source (per-frame mean luma); do not re-measure, just implement.

# Files
Only `src/compositions/ReferenceStudy/index.tsx`. Keep its CRLF line endings and its compact one-line JSX style. Change nothing outside the transition overlay.

# Steps
1. Above `export const ReferenceStudy`, add one table, with a one-line comment saying the values are per-local-frame overlay opacities measured from the source cut (luma), local frame = `frame - shot.start`:
   ```ts
   const CUT_FX:Record<number,{fill:string;opacity:number[]}>={
    8:{fill:'#fff',opacity:[.77,.52,.26]},
    9:{fill:'#000',opacity:[.77,.43,.22,.07]},
    20:{fill:'#fff',opacity:[.82,.55,.27]},
    23:{fill:'#000',opacity:[.78,.50,.29,.13,.03]},
    28:{fill:'#000',opacity:[.875,.73,.59,.45,.32,.18,.18,.18,.18,.18,.18,.15,.08]},
    31:{fill:'#000',opacity:[.78,.68,.58,.48,.38,.30,.22,.12,.02]},
    32:{fill:'#000',opacity:[.75,.61,.50,.36,.25,.14,.05]},
   };
   ```
   Past the end of a shot's array the opacity is 0 (no overlay).
2. Replace the existing shot-20-only flash line (the `{/* source cut flash ... */}{sourceAssisted&&shot.id===20&&local<3?<rect .../>:null}` expression) with ONE generic expression at the same position that, when `sourceAssisted` is true and `CUT_FX[shot.id]?.opacity[local]` is a number > 0, draws `<rect width={W} height={H} fill={fx.fill} opacity={value}/>`. Shot 20's output must stay identical (same values as before: .82, .55, .27).
3. Do not touch the existing shot-28 dark grade rect, the clock, the vignette, the camera, or anything else.

# Done when
The gate command passes (exit 0, prints KEEP): every target shot 8/9/23/28/31/32 lowers frame or actor MAE without lowering SSIM, and guards (20 plus same-stage shots) do not regress. Do NOT edit scripts/, baselines under out/, shots.ts or any JSON. If a target cannot pass with these exact numbers, STOP and report which shot and the gate output; do not invent other changes.
