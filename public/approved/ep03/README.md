# Approved Part 3 narration

These small voice assets keep the reviewed Iapetus delivery reproducible without a new TTS request.

- Nineteen scenes retain the existing approved recordings.
- `rewind.mp3` and `deadline.mp3` use the complete opening lines from the replacement take. The incomplete remainder of that take was rejected.
- The vote caption uses the approved B wording; the unclear phrase is now `?????????`.
- `whisper.mp3` already contains the timing-preserving lower-pitch effect. The first mimic request and all narration use the normal voice.
- `timing.json` records the matching script, voice/model/tempo, word timestamps and applied effects.

`voiceClips` in `episodes/ep03.json` selects this manifest. The pipeline validates its text, voice, effects and timing, regenerates captions from the current episode, and fails if a clip has become stale. To change spoken text, replace and verify the corresponding recording and manifest entry. Caption-only changes do not require new speech.
