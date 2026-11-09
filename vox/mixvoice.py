#!/usr/bin/env python3
"""Place the 12 ElevenLabs scene clips (build/vo/sNN.mp3) on the 144 s timeline,
write voice.js (clip start/duration, used to retime captions) and build/voice.wav."""
import json, subprocess, os
D = 'voiceover'
OFFSET = {1: .7}          # scene 1: voice starts a little later so the line lands on the 9:00 slam
MAXLEN = 11.6             # a clip must end before the next scene's wipe
meta = []
cmd = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error']
filt = []
for i in range(1, 13):
    src = f'{D}/s{i:02d}.mp3'
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]))
    start = OFFSET.get(i, .4)
    tempo = max(1.0, dur / (MAXLEN - start))
    dur /= tempo
    meta.append(dict(scene=i, start=round(start, 3), dur=round(dur, 3), tempo=round(tempo, 3)))
    cmd += ['-i', src]
    t = f',atempo={tempo:.4f}' if tempo > 1.0005 else ''
    filt.append(f'[{i-1}:a]aresample=44100,pan=mono|c0=c0{t},adelay={int((i-1)*12000+start*1000)}:all=1[v{i}]')
filt.append(''.join(f'[v{i}]' for i in range(1, 13)) + 'amix=inputs=12:normalize=0,apad=whole_dur=144,atrim=0:144,loudnorm=I=-16:TP=-1.5:LRA=7[out]')
cmd += ['-filter_complex', ';'.join(filt), '-map', '[out]', '-ar', '44100', 'build/voice.wav']
subprocess.check_call(cmd)
open('voice.js', 'w').write('const VOICE = ' + json.dumps(meta) + ';\n')
print(json.dumps(meta))
