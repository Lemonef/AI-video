"""Procedural, licence-free sound effects. pop / tick / whoosh (ffmpeg) are the v1/v2 set and must
not change; the v3 beds and one-shots come from foley.py (numpy)."""
from pathlib import Path

from . import foley, media

SOUNDS = {
    "pop.wav": "aevalsrc=0.8*sin(2*PI*(380+2600*t)*t)*exp(-28*t):d=0.16",
    "tick.wav": "aevalsrc=0.7*sin(2*PI*1750*t)*exp(-55*t):d=0.09",
    "whoosh.wav": "anoisesrc=d=0.45:c=pink:a=0.5,highpass=f=500,lowpass=f=3500,afade=t=in:d=0.18,afade=t=out:st=0.22:d=0.23",
}


def ensure(public_dir: Path) -> None:
    out_dir = public_dir / "sfx"
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, expr in SOUNDS.items():
        target = out_dir / name
        if not target.exists():
            media.synth(expr, target)
    foley.ensure(out_dir)
