import pathlib
import subprocess
import json

base = pathlib.Path(r"D:\AI-video\out\drafts\reference-library-2026-10-31")
batch2 = [
    {"number": 30, "id": "DevNsm4IfHt", "url": "https://www.instagram.com/p/DevNsm4IfHt/"},
    {"number": 31, "id": "DdMUB4kskYv", "url": "https://www.instagram.com/p/DdMUB4kskYv/"},
    {"number": 32, "id": "DeghgsivKu7", "url": "https://www.instagram.com/p/DeghgsivKu7/"},
    {"number": 33, "id": "De5ZlEnvtjG", "url": "https://www.instagram.com/p/De5ZlEnvtjG/"},
    {"number": 34, "id": "DeZCLJBBrmn", "url": "https://www.instagram.com/p/DeZCLJBBrmn/"},
    {"number": 35, "id": "DeaC2hYgubX", "url": "https://www.instagram.com/p/DeaC2hYgubX/"},
    {"number": 36, "id": "Dd7N85rt8NY", "url": "https://www.instagram.com/p/Dd7N85rt8NY/"}
]

results = {}
for item in batch2:
    p_dir = base / item["id"]
    p_dir.mkdir(parents=True, exist_ok=True)
    out_template = str(p_dir / "source.%(ext)s")
    print(f"Attempting download for {item['id']} ({item['url']})...")
    cmd = ["yt-dlp", "--write-info-json", "-o", out_template, item["url"]]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        results[item["id"]] = "SUCCESS"
        print(f"Downloaded {item['id']}")
    else:
        err_msg = res.stderr.strip()
        results[item["id"]] = f"ERROR: {err_msg}"
        print(f"Failed {item['id']}: {err_msg[:200]}")
        (p_dir / "download_error.txt").write_text(err_msg, encoding="utf-8")

(base / "batch2_download_status.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
