"""Real recorded sound from Freesound, CC0 only (no attribution needed, commercial use OK).

Each library name maps to a search; the best-rated clip in a sensible length range wins and its
high-quality preview is saved to public/sfx/real/<name>.mp3. Choices are pinned in
public/sfx/real/credits.json, so a rebuild never silently swaps a sound.
Key: FREESOUND_API_KEY or ~/.secrets/freesound_api_key (token auth gives the HQ previews).
"""
import json
import os
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://freesound.org/apiv2/search/text/"
KEY_FILE = Path.home() / ".secrets" / "freesound_api_key"
CC0 = 'license:"Creative Commons 0"'

# name: (query, min_sec, max_sec). Beds want long, steady recordings; one-shots want short hits.
LIBRARY = {
    "forest_night": ("night forest crickets ambience", 30, 400),
    "wind": ("wind trees forest ambience", 20, 400),
    "rain": ("rain forest ambience", 20, 400),
    "dark_drone": ("dark ambient drone horror", 15, 300),
    "steps_leaves": ("footsteps forest leaves walking", 3, 60),
    "flashlight_click": ("flashlight click switch", 0.1, 3),
    "heartbeat": ("heartbeat slow", 1, 20),
    "hit": ("cinematic impact hit", 0.5, 6),
    "boom": ("cinematic boom sub", 1, 10),
    "riser": ("horror riser tension", 2, 12),
    "stinger": ("horror stinger scare", 1, 8),
    "whoosh": ("whoosh swish transition", 0.2, 3),
}


def _key() -> str:
    key = os.environ.get("FREESOUND_API_KEY") or (KEY_FILE.read_text().strip() if KEY_FILE.exists() else "")
    if not key:
        raise RuntimeError(f"no Freesound key: set FREESOUND_API_KEY or put it in {KEY_FILE}")
    return key


def _search(query: str, lo: float, hi: float) -> list[dict]:
    params = {
        "query": query,
        "filter": f"{CC0} duration:[{lo} TO {hi}]",
        "fields": "id,name,username,duration,avg_rating,num_downloads,previews,url,license",
        "sort": "rating_desc",
        "page_size": 15,
        "token": _key(),
    }
    with urllib.request.urlopen(f"{API}?{urllib.parse.urlencode(params)}", timeout=60) as r:
        return json.load(r).get("results", [])


def _score(s: dict) -> float:
    # Rating alone favours obscure 1-vote 5.0s; weight by how many people actually used it.
    return (s.get("avg_rating") or 0) * (1 + (s.get("num_downloads") or 0)) ** 0.5


def ensure(public_dir: Path, names: list[str] | None = None) -> dict:
    out_dir = public_dir / "sfx" / "real"
    out_dir.mkdir(parents=True, exist_ok=True)
    credits_path = out_dir / "credits.json"
    credits = json.loads(credits_path.read_text(encoding="utf-8")) if credits_path.exists() else {}
    for name in names or list(LIBRARY):
        target = out_dir / f"{name}.mp3"
        if name in credits and target.exists():
            continue
        query, lo, hi = LIBRARY[name]
        results = _search(query, lo, hi)
        if not results:
            raise RuntimeError(f"no CC0 result for {name!r} ({query})")
        best = max(results, key=_score)
        with urllib.request.urlopen(best["previews"]["preview-hq-mp3"], timeout=120) as r:
            target.write_bytes(r.read())
        credits[name] = {k: best[k] for k in ("id", "name", "username", "url", "license", "duration")}
        print(f"  ♪ {name}: {best['name'][:50]} by {best['username']} ({best['duration']:.0f}s)")
        credits_path.write_text(json.dumps(credits, ensure_ascii=False, indent=1), encoding="utf-8")
    return credits
