import json
import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

sys.path.insert(0,str(Path(__file__).resolve().parent.parent/'scripts'))
from pipeline.narrate import narrate,needs_voicing


def fixture(tmp_path,monkeypatch):
    from pipeline import narrate as module
    public=tmp_path/'public';public.mkdir()
    (public/'clip.mp3').write_bytes(b'approved audio')
    scene={'id':'line','say':'hello','caption':'approved display'}
    ep={'id':'ep03','engine':'gemini','voice':'Iapetus','voiceModel':'pinned','tempo':1.03,'voiceClips':'manifest.json','scenes':[scene]}
    manifest={k:ep[k] for k in ('engine','voice','voiceModel','tempo')}
    manifest['clips']={'line':{'say':'hello','audio':'clip.mp3','words':[{'text':'hello','start':.1,'end':.8}]}}
    def save(): (public/'manifest.json').write_text(json.dumps(manifest))
    save();monkeypatch.setattr(module.media,'duration',lambda path:1.0)
    return public,ep,manifest,save


def test_approved_clips_rebuild_captions_without_a_voice_request(tmp_path,monkeypatch):
    public,ep,manifest,save=fixture(tmp_path,monkeypatch)
    engine=SimpleNamespace(whole_take=True)
    assert not needs_voicing(ep,engine,public)
    result=narrate(ep,engine,public)
    assert result['line']['audio']=='clip.mp3'
    assert result['line']['words'][0]['start']==.1
    assert result['line']['cues'][0]['text']=='approved display'


@pytest.mark.parametrize('change',['text','voice','effect','outside_public','word_time'])
def test_approved_clips_reject_stale_or_invalid_sources(tmp_path,monkeypatch,change):
    public,ep,m,save=fixture(tmp_path,monkeypatch)
    if change=='text': ep['scenes'][0]['say']='different'
    if change=='voice': ep['voice']='different'
    if change=='effect': ep['scenes'][0]['monster']='hello'
    if change=='outside_public': m['clips']['line']['audio']='../other.mp3'
    if change=='word_time': m['clips']['line']['words'][0]['end']=3
    save()
    with pytest.raises(ValueError):narrate(ep,SimpleNamespace(whole_take=True),public)
