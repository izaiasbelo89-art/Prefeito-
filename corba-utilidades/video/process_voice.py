"""Melhora a locução: encurta pausas longas, acelera levemente (sem mudar o tom) e trata o som.
Gera ../audio/locucao-final.wav e warp.js (mapa de tempo original -> novo para sincronizar a animação)."""
import numpy as np, wave, json, subprocess
SR = 44100
TEMPO = 1.08
w = wave.open('../audio/locucao-original-recortada.wav'); ch = w.getnchannels()
x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, ch).mean(axis=1) / 32768
hop = int(.01 * SR)
rms = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x), hop)])
silent = 20 * np.log10(rms + 1e-9) < -40
# pausas (>= 0.12 s)
pauses = []; i = 0
while i < len(silent):
    if silent[i]:
        j = i
        while j < len(silent) and silent[j]: j += 1
        a, b = i * .01, j * .01
        if b - a >= .12 and a > 0.05 and b < len(x) / SR - .05: pauses.append((a, b))
        i = j
    else: i += 1
def target(d):  # nova duração da pausa
    if d >= .45: return .26          # fim de frase
    if d >= .25: return .17          # vírgula
    return min(d, .12)
out = []; bps = [(0.0, 0.0)]; cur_old = 0.0; cur_new = 0.0; fade = int(.008 * SR)
def take(a, b):
    return x[int(a * SR):int(b * SR)].copy()
for a, b in pauses:
    seg = take(cur_old, a); out.append(seg); cur_new += len(seg) / SR
    bps.append((a, cur_new))
    d = target(b - a); keep = take(a, a + d / 2), take(b - d / 2, b)
    k0, k1 = keep
    if len(k0) > fade: k0[-fade:] *= np.linspace(1, 0, fade)
    if len(k1) > fade: k1[:fade] *= np.linspace(0, 1, fade)
    out += [k0, k1]; cur_new += (len(k0) + len(k1)) / SR
    cur_old = b; bps.append((b, cur_new))
seg = take(cur_old, len(x) / SR); out.append(seg); cur_new += len(seg) / SR; bps.append((len(x) / SR, cur_new))
y = np.concatenate(out)
with wave.open('../audio/_tmp_tight.wav', 'wb') as o:
    o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
af = (f'atempo={TEMPO},highpass=f=85,equalizer=f=220:t=q:w=1.2:g=-2.5,equalizer=f=3200:t=q:w=1.4:g=3,'
      'highshelf=f=9000:g=2,deesser=i=0.35,acompressor=threshold=-22dB:ratio=3:attack=5:release=90:makeup=3dB,'
      'afade=t=in:d=0.01')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', '../audio/_tmp_tight.wav', '-af', af, '-ar', str(SR), '-ac', '1', '../audio/locucao-final.wav'], check=True)
bps = [(round(o, 4), round(n / TEMPO, 4)) for o, n in bps]
old_len = len(x) / SR; new_len = bps[-1][1]
print(f'pausas encurtadas: {len(pauses)}; {old_len:.2f}s -> {new_len:.2f}s')
open('warp.js', 'w').write('// mapa de tempo: [tempo na locução original, tempo na locução final]\nconst WARP = ' + json.dumps(bps) + ';\n')
json.dump(bps, open('warp.json', 'w'))
