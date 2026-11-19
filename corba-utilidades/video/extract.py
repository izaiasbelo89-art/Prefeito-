"""Extrai os quadros (30 fps, 1080x1920, recorte central) de cada trecho de vídeo usado (clips.json)."""
import json, os, subprocess, shutil
for c in json.load(open('clips.json')):
    d = f"out/frames/{c['id']}"; shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    dur_out = c['t1'] - c['t0']; dur_src = dur_out * c['speed']
    vf = (f"setpts=PTS/{c['speed']},fps=30,scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920,"
          "unsharp=5:5:0.6:5:5:0.0,eq=saturation=1.12:contrast=1.04")
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(c['src']), '-t', str(dur_src + .2), '-i', f"../assets/videos/{c['file']}",
                    '-vf', vf, '-q:v', '3', '-frames:v', str(int(dur_out * 30) + 2), f'{d}/%04d.jpg'], check=True)
    print(c['id'], len(os.listdir(d)), 'quadros')
