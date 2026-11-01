"""Private benchmark: curate cached local OCR into measured caption layout.

No model/network calls. Text is from source inspection, never a proposed Jaab
script. Five-frame OCR sampling brackets onsets; it is not exact transcription
or font certification. Keep the source, OCR proofs and source-derived output local.
"""
import difflib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
PROOF=ROOT/'out/drafts/reference-study/DegJCmXtbGj/caption-proof'
# Inspected chunks. Last column marks emphasized source words, not voice cues.
SPEC='''10|24|WHAT IF A|
24|46|ZOMBIE OUTBREAK|ZOMBIE OUTBREAK
47|61|STARTED...|
63|96|WHILE YOU WERE CLOSING|
98|116|A SUPERMARKET,|
117|180|ALL ALONE?|red
180|236|IT'S 10:52 AT NIGHT.|10:52
238|251|EIGHT MINUTES|
253|285|TO CLOSING.|
286|300|THEN YOUR PHONE|
300|330|STARTS SCREAMING.|SCREAMING.
373|383|EMERGENCY ALERT.|red
384|407|A DEADLY INFECTION|DEADLY INFECTION
408|428|IS SPREADING|
429|457|THROUGH THE CITY.|
458|492|STAY INSIDE.|
493|541|DO NOT GO OUT.|
543|572|THROUGH THE GLASS,|
573|600|YOU SEE WHY.|WHY.
601|632|PEOPLE ARE SPRINTING|
633|663|ACROSS THE CAR PARK...|
664|687|AND THE ONES|
688|707|CHASING THEM|
708|750|NEVER GET TIRED.|red
751|797|YOUR FIRST INSTINCT?|
798|817|GRAB YOUR KEYS|KEYS
818|855|AND DRIVE HOME.|
887|912|EVERY ROAD|
913|931|OUT OF TOWN|
932|976|IS ALREADY JAMMED.|JAMMED.
977|992|OUT THERE,|
993|1008|YOU'D BE TRAPPED|
1009|1042|IN A CAR.|
1043|1057|BECAUSE WITHOUT|
1058|1087|REALISING IT,|
1088|1111|YOU'RE STANDING IN|
1112|1141|ONE OF THE BEST PLACES|BEST PLACES
1142|1181|TO SURVIVE THIS.|
1182|1227|30,000 PRODUCTS.|30,000
1228|1262|A STEEL SHUTTER.|SHUTTER.
1263|1282|A LOADING DOCK|
1283|1317|YOU CAN LOCK.|LOCK.
1318|1336|BUT ONLY IF|
1337|1347|YOU FIX|
1348|1372|ONE PROBLEM|ONE PROBLEM
1373|1387|IN THE NEXT|
1388|1427|FIVE MINUTES.|FIVE MINUTES.
1428|1442|THE WHOLE FRONT|
1443|1457|OF THE SHOP|
1458|1487|IS GLASS.|GLASS.
1488|1502|EVERY LIGHT|
1503|1531|IS STILL ON.|
1532|1571|AND THEY'VE NOTICED.|NOTICED.
1572|1582|YOU SLAM|
1583|1612|THE SHUTTER BUTTON.|
1613|1632|IT ROLLS DOWN...|
1633|1657|AND JAMS.|JAMS.
1658|1703|KNEE HEIGHT.|
1704|1722|SHUTTERS LIKE THIS|
1723|1752|HAVE A HAND CHAIN,|HAND CHAIN,
1753|1767|FOR WHEN|
1768|1806|THE MOTOR FAILS.|
1807|1841|FORTY PULLS.|FORTY PULLS.
1842|1867|THIRTY-EIGHT...|
1868|1890|THIRTY-NINE...|
1891|1907|SOMETHING GRABS|GRABS
1908|1937|THE BOTTOM EDGE...|
1938|1967|THEN LETS GO.|
1968|1990|FORTY.|FORTY.
1991|2008|THE SHUTTER|
2009|2047|HITS THE FLOOR.|
2048|2087|SHOP RULE ONE:|
2088|2122|IF THEY CAN SEE YOU,|
2123|2162|THEY COME.|COME.
2163|2197|LIGHTS OFF.|
2198|2212|IN THE DARK,|
2213|2232|YOU COUNT|
2233|2262|WHAT YOU'VE GOT.|
2263|2297|FOOD FOR YEARS.|YEARS.
2298|2337|WATER FOR MONTHS.|
2338|2362|FOR THE FIRST TIME|
2363|2382|TONIGHT,|
2383|2432|YOU BREATHE.|
2433|2462|THEN THE NIGHT GUARD'S|
2463|2487|WALKIE-TALKIE|WALKIE-TALKIE
2488|2497|CRACKLES|
2498|2532|ON THE COUNTER.|
2533|2547|HE WENT HOME|
2548|2587|AT TEN.|TEN.
2588|2607|SOMEONE WHISPERS|WHISPERS
2608|2623|INTO IT...|
2629|2653|WHO TURNED OFF|red
2654|2682|THE LIGHTS?|red'''

def norm(text):
    return ''.join(c for c in text.upper() if c.isalnum())

def main():
    candidates=[]
    for filename in ['ocr-clean.json','ocr-dense.json','ocr-samples.json']:
        candidates.extend(json.loads((PROOF/filename).read_text(encoding='utf-8-sig')))
    chunks=[]
    for line in SPEC.splitlines():
        start,end,text,emphasis=line.split('|');start,end=int(start),int(end)
        pool=[row for row in candidates if start<=row['frame']<end and row['text']]
        score=lambda row:difflib.SequenceMatcher(None,norm(text),norm(row['text'])).ratio()
        best=max(pool,key=score) if pool else None
        words=[w for l in best['lines'] for w in l['words']] if best else []
        valid=[w for w in words if 1190<=w['y']<=1335 and 20<=w['height']<=130]
        measured=best is not None and score(best)>.85 and bool(valid)
        if measured:
            left=min(w['x'] for w in valid);top=min(w['y'] for w in valid)
            right=max(w['x']+w['width'] for w in valid);bottom=max(w['y']+w['height'] for w in valid)
            height=sorted(w['height'] for w in valid)[len(valid)//2]
            x=(left+right)/2;y=bottom;width=right-left
        else:
            x,y,height=540,1280,60
            width=min(990,len(text)*33)
        chunks.append(dict(start=start,end=end,text=text,emphasis=emphasis,x=round(x,2),baseline=round(y,2),
                           width=round(width,2),height=round(height,2),measured=measured,
                           proof_frame=best['frame'] if best else None,
                           proof=best['proof'] if best else None,
                           timing_uncertainty_frames=5))
    result={'provenance':'Private reference-derived OCR/inspection. Source5-frame caption sampling; exact onset, font and animation remain open. Not original Jaab dialogue.',
            'coordinate_plane':[1080,1920],'chunks':chunks}
    target=ROOT/'src/compositions/ReferenceStudy/private-caption-layout.json'
    target.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(f'{len(chunks)} caption chunks; {sum(c["measured"] for c in chunks)} measured layouts; timing uncertainty explicit.')

if __name__=='__main__':main()
