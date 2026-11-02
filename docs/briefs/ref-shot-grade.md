---json
{"id": "ref-shot-grade", "type": "normal", "risk": "low", "repo": "D:/AI-video", "gates": ["python scripts/gate_in_worktree.py --shots 3 19 23 28 32 34"], "protected": ["scripts/**", "out/**", "public/**", "package.json", "package-lock.json", "src/compositions/ReferenceStudy/shots.ts", "src/compositions/ReferenceStudy/*.json", "docs/**"], "context_files": ["src/compositions/ReferenceStudy/index.tsx"]}
---
# Goal
Match each listed shot's overall brightness to the source in the `ReferenceAssisted` render with one per-shot linear grade. Slopes are measured (source mean luma / render mean luma over the shot, first 6 frames skipped); do not re-measure.

# Files
Only `src/compositions/ReferenceStudy/index.tsx`. Keep CRLF line endings and the compact one-line JSX style.

# Steps
1. Above `export const ReferenceStudy`, add, with a one-line comment stating the derivation above:
   ```ts
   const SHOT_GRADE:Record<number,number>={3:1.21,19:1.10,23:1.12,28:.85,32:.79,34:.63};
   ```
2. In the returned `<svg>`, when `sourceAssisted` is true and `SHOT_GRADE[shot.id]` exists: add to its `<defs>` a filter `id="shot-grade"` (`colorInterpolationFilters="sRGB"`, filter region x/y 0, width/height 100%, `filterUnits="userSpaceOnUse"`) containing `<feComponentTransfer>` with `feFuncR`, `feFuncG`, `feFuncB` each `type="linear" slope={grade}`; and wrap every existing child of the `<svg>` except `<defs>` in one `<g filter="url(#shot-grade)">`. When there is no grade, render exactly as today (no wrapper, no filter).
3. Change nothing else.

# Done when
The gate command exits 0 and prints KEEP. If any target shot fails, STOP and report the full gate output for that shot; do not tune slopes or change other code.
