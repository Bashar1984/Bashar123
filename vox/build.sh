#!/usr/bin/env bash
# Rebuild: grain -> voice track (voiceover/*.mp3, ElevenLabs 'Jennica') -> frames (4 workers) -> music -> duck+mix -> mp4
set -e; cd "$(dirname "$0")"; mkdir -p build/frames
[ -f grain.png ] || python3 gen_grain.py
python3 mixvoice.py > /dev/null
n=3456; per=$((n/4))
for i in 0 1 2 3; do node render.js $((i*per)) $(((i+1)*per)) build/frames & done; wait
python3 music.py
./mixdown.sh
ffmpeg -y -framerate 24 -i build/frames/%05d.jpg -i build/mix.wav -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -shortest vox-what-if-ai-stopped-16x9-voiceover.mp4
