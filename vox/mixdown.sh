#!/usr/bin/env bash
# music + ElevenLabs voice (music ducks hard under the narration) -> build/mix.wav, mastered to ~-14 LUFS
cd "$(dirname "$0")"
ffmpeg -y -hide_banner -loglevel error -i build/music.wav -i build/voice.wav -filter_complex \
"[1:a]aformat=channel_layouts=stereo,volume=1.6,asplit=2[vsc][vmix];[0:a]volume=0.5[m];[m][vsc]sidechaincompress=threshold=0.015:ratio=10:attack=15:release=500:makeup=1[md];[md][vmix]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.0:LRA=9[out]" \
-map "[out]" -ar 44100 build/mix.wav
