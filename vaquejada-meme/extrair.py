"""Extrai quadros 1080x1920 de cada trecho (segmentos.json) em out/frames/<id>/."""
import json, os, subprocess, shutil
for s in json.load(open('segmentos.json')):
    d = f"out/frames/{s['id']}"; shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(s['a']), '-t', str(s['b'] - s['a']), '-i', s['file'],
                    '-vf', f"fps={s['fps']},scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920", '-q:v', '3', f'{d}/%04d.jpg'], check=True)
    s['n'] = len(os.listdir(d)); print(s['id'], s['n'])
    s.pop('file')
    json.dump(s, open(f'{d}/info.json', 'w'))
