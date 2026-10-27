"""Real recorded sound from Freesound, CC0 only (no attribution needed, commercial use OK).

Each library name maps to a search; the best-rated clip in a sensible length range wins and its
high-quality preview is saved to public/sfx/real/<name>.mp3. Choices are pinned in
public/sfx/real/credits.json, so a rebuild never silently swaps a sound.
Key: FREESOUND_API_KEY or ~/.secrets/freesound_api_key (token auth gives the HQ previews).
"""
import json
import os
import subprocess
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


# Hand-picked after reviewing candidates by name + tags (rating-only search returned a creature
# horn for "rain" and a woosh for "boom"). A pinned id always wins over the search.
PINNED = {
    "forest_night": 328293,  # Forest at night, crickets, cicadas (B&K field recording)
    "wind": 201897,  # Windy Forest
    "rain": 678435,  # Soft Rain in Forest, raindrops on leaves
    "dark_drone": 33796,  # subtle bass/breath atmosphere
    "steps_leaves": 218305,  # sneakers on dry leaves
    "hit": 648534,  # deep cinematic transition hit
    "boom": 346316,  # sub drop
    "stinger": 271945,  # dramatic stinger/stab
    "whoosh": 683096,  # airy soft woosh
    "heartbeat": 249716,  # slow heartbeat
    "riser": 840719,  # simple tension riser
}

BEDS = {"forest_night", "wind", "rain", "dark_drone", "steps_leaves"}
# One-shots whose recording holds more than one event: keep only the first. heartbeat's 2nd
# lub-dub sits 2.5 s in, so every cue fired a stray beat wherever that happened to land.
CUT_SEC = {"heartbeat": 1.0}
CUT_FADE_SEC = 0.15
BED_LUFS = -24  # beds sit under the voice
HIT_LUFS = -14  # one-shots punch at voice level


def _finish(raw: Path, out: Path, bed: bool, cut: float | None = None) -> None:
    """Normalise loudness so every clip mixes predictably; one-shots get leading silence trimmed
    so a cue lands exactly on its word, and `cut` keeps only the first `cut` seconds (faded)."""
    trim = [] if bed else ["silenceremove=start_periods=1:start_threshold=-45dB"]
    if cut:
        trim += [f"atrim=0:{cut}", f"afade=t=out:st={cut - CUT_FADE_SEC}:d={CUT_FADE_SEC}"]
    af = ",".join(trim + [f"loudnorm=I={BED_LUFS if bed else HIT_LUFS}:TP=-1.5"])
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af", af, "-ar", "48000", "-ac", "2", "-b:a", "192k", str(out)], check=True)


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


FIELDS = "id,name,username,duration,avg_rating,num_downloads,previews,url,license"


def _sound(sound_id: int) -> dict:
    url = f"https://freesound.org/apiv2/sounds/{sound_id}/?{urllib.parse.urlencode({'fields': FIELDS, 'token': _key()})}"
    with urllib.request.urlopen(url, timeout=60) as r:
        s = json.load(r)
    if "Creative Commons 0" not in s.get("license", "") and "publicdomain/zero" not in s.get("license", ""):
        raise RuntimeError(f"pinned sound {sound_id} is not CC0: {s.get('license')}")
    return s


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
        pinned = PINNED.get(name)
        fresh = name in credits and target.exists() and credits[name].get("cut") == CUT_SEC.get(name)
        if fresh and (pinned is None or credits[name]["id"] == pinned):
            continue
        if name in PINNED:
            best = _sound(PINNED[name])
        else:
            query, lo, hi = LIBRARY[name]
            results = _search(query, lo, hi)
            if not results:
                raise RuntimeError(f"no CC0 result for {name!r} ({query})")
            best = max(results, key=_score)
        raw = out_dir / f"{name}.download.mp3"
        with urllib.request.urlopen(best["previews"]["preview-hq-mp3"], timeout=120) as r:
            raw.write_bytes(r.read())
        _finish(raw, target, name in BEDS, CUT_SEC.get(name))
        raw.unlink()
        credits[name] = {k: best[k] for k in ("id", "name", "username", "url", "license", "duration")}
        if name in CUT_SEC:
            credits[name]["cut"] = CUT_SEC[name]
        print(f"  ♪ {name}: {best['name'][:50]} by {best['username']} ({best['duration']:.0f}s)")
        credits_path.write_text(json.dumps(credits, ensure_ascii=False, indent=1), encoding="utf-8")
    return credits
