#!/usr/bin/env bash
# music + ElevenLabs voice (music ducks under the narration) -> build/mix.wav
cd "$(dirname "$0")"
ffmpeg -y -hide_banner -loglevel error -i build/music.wav -i build/voice.wav -filter_complex \
"[1:a]asplit=2[vsc][vmix];[0:a]volume=0.8[m];[m][vsc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400:makeup=1[md];[md][vmix]amix=inputs=2:normalize=0,alimiter=limit=0.95[out]" \
-map "[out]" -ar 44100 build/mix.wav
