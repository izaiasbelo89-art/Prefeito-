"""Trilha do meme v3: áudio original (narrador) seguindo a velocidade da imagem; silêncio + boom grave nos travamentos."""
import numpy as np, wave, json
from scipy.signal import butter, sosfilt, resample
SR = 44100; T = json.load(open('tempos.json')); DUR = T['DUR']; N = int(SR * DUR); rng = np.random.default_rng(5)
def rd(f): w = wave.open(f); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(SR * d)) / SR
mix = np.zeros(N)
def add(x, t0, g=1.0):
    i = int(t0 * SR)
    if i >= N: return
    seg = mix[i:i + len(x)]; seg += x[:len(seg)] * g
def fade(x, fi=.01, fo=.02):
    x = x.copy(); a, b = int(fi * SR), int(fo * SR); x[:a] *= np.linspace(0, 1, a); x[-b:] *= np.linspace(1, 0, b); return x
full = rd('out/orig_full.wav'); riso = rd('out/orig_riso.wav')
cut = lambda a, b: full[int(a * SR):int(b * SR)]
for s in T['TL']:
    if s['k'] != 'play' or s['v'] < 0: continue
    x = cut(s['a'], s['b'])
    if s['v'] != 1: x = lp(resample(x, int(len(x) / s['v'])), 3500)
    add(fade(x), s['t0'], 1.3)
add(fade(cut(27.1, 28.9), .05, .15), T['boi'], 1.2)
add(fade(riso, .05, .3), T['riso'], 2.4)
def boom():
    d = 1.4; t = tt(d); f = 38 + 85 * np.exp(-t * 9)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6) + np.sin(4 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) * .3
    x += lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 18) * .5
    return np.tanh(x * 1.6) * .9
def whoosh(d=.5):
    n = rng.standard_normal(int(SR * d)); t = tt(d); return (lp(n, 5000) - lp(n, 500)) * np.sin(np.pi * t / d) ** 2 * .45
def rewind(d):
    t = tt(d); f = 900 + 2600 * (t / d); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .25 + (lp(rng.standard_normal(len(t)), 7000) - lp(rng.standard_normal(len(t)), 1500)) * .5
    return x * (.6 + .4 * np.sin(2 * np.pi * 22 * t)) * np.minimum(1, t / .03) * np.minimum(1, (d - t) / .05) * .6
for s in T['TL']:
    if s['k'] == 'play' and s['v'] < 0: add(rewind(s['t1'] - s['t0'] + .05), s['t0'])
for s in T['TL']:
    if s['k'] == 'freeze': add(boom(), s['t0'], 1.0)
add(whoosh(.35), T['boi'] - .12, .8); add(whoosh(.35), T['riso'] - .12, .8)
mix = np.tanh(mix * 1.1) / np.tanh(1.1); mix /= np.abs(mix).max() / .89; mix[-int(.08 * SR):] *= np.linspace(1, 0, int(.08 * SR))
with wave.open('out/audio_raw.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('ok', len(mix) / SR)
