"""Trilha do meme: áudio original da arena + efeitos sintetizados (sem material de terceiros)."""
import numpy as np, wave, json
from scipy.signal import butter, sosfilt, resample
SR = 44100; T = json.load(open('tempos.json')); DUR = T['DUR']; N = int(SR * DUR)
rng = np.random.default_rng(3)
def rd(f):
    w = wave.open(f); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
def tt(d): return np.arange(int(SR * d)) / SR
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def env(n, a, r): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
def sine(f, d): return np.sin(2 * np.pi * f * tt(d))
mix = np.zeros(N)
def add(x, t0, g=1.0):
    i = int(t0 * SR)
    if i >= N: return
    seg = mix[i:i + len(x)]; seg += x[:len(seg)] * g
def fade(x, fi=.02, fo=.05):
    x = x.copy(); a, b = int(fi * SR), int(fo * SR); x[:a] *= np.linspace(0, 1, a); x[-b:] *= np.linspace(1, 0, b); return x
full = rd('out/orig_full.wav'); riso = rd('out/orig_riso.wav')
cut = lambda a, b: full[int(a * SR):int(b * SR)]
add(fade(cut(14.2, 19.55), .05, .04), T['aprox'], 1.3)
for t0, t1, a, b, v in T['RAMP_T']:
    seg = cut(a, b); add(fade(lp(resample(seg, int(len(seg) / v)), 3500), .02, .03), t0, 1.2)
add(fade(cut(21.05, 23.8), .03, .2), T['chao'], 1.3)
add(fade(cut(27.1, 28.9), .05, .15), T['boi'], 1.2)
add(fade(riso, .05, .3), T['riso'], 2.4)
# ---- efeitos ----
def scratch():
    d = .45; t = tt(d); f = 400 + 1600 * np.abs(np.sin(2 * np.pi * 5 * t)); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .5 + bp(rng.standard_normal(len(t)), 800, 5000) * .6
    return x * env(len(t), .005, .25) * .7
def whoosh(d=.4, g=.5): n = rng.standard_normal(int(SR * d)); t = tt(d); return bp(n, 600, 6000) * np.sin(np.pi * t / d) ** 2 * g
def suspense(d):
    t = tt(d); f = 55 * 2 ** (t / d * 1.0); x = np.sin(2 * np.pi * np.cumsum(f) / SR) + .5 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    pulse = (np.sin(2 * np.pi * (2 + 4 * t / d) * t) > 0) * .4 + .6
    return lp(x, 900) * (t / d) ** 1.5 * pulse * .35
def thud():
    d = .7; t = tt(d); x = np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-t * 18)) / SR) * np.exp(-t * 6) + lp(rng.standard_normal(len(t)), 400) * np.exp(-t * 10) * .6
    return x * .9
def crowd(d=1.6):
    t = tt(d); out = np.zeros(len(t))
    for k in range(18):  # várias vozes "uuuh" com tons e atrasos diferentes
        f0 = rng.uniform(140, 330); dl = rng.uniform(0, .15); f = f0 * (1 + .08 * np.sin(2 * np.pi * rng.uniform(4, 7) * t)) * (1 - .25 * t / d)
        v = np.sin(2 * np.pi * np.cumsum(f) / SR) + .4 * np.sin(4 * np.pi * np.cumsum(f) / SR)
        e = np.clip((t - dl) / .15, 0, 1) * np.clip((d - t) / .5, 0, 1); out += lp(v, 1200) * e
    return out / 18 * 1.6 + bp(rng.standard_normal(len(t)), 300, 3000) * np.clip((d - t) / d, 0, 1) * .1
def whistle():
    d = .9; t = tt(d); f = 2900 + 160 * (np.sin(2 * np.pi * 38 * t) > 0); x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    e = np.ones(len(t)); e[(t > .25) & (t < .32)] = 0; return x * e * env(len(t), .01, 2) * np.clip((d - t) / .05, 0, 1) * .25
def tvbeep():
    out = np.zeros(int(SR * .7))
    for k, f in enumerate((880, 1320)):
        x = sine(f, .18) * env(int(SR * .18), .005, .3); i = int(k * .22 * SR); out[i:i + len(x)] += x
    return out * .35
def boing():
    d = .6; t = tt(d); f = 220 + 140 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) * .45
def pop(f=900): d = .12; t = tt(d); fr = f * (1 + 1.2 * np.exp(-t * 40)); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(int(SR * d), .001, .035) * .45
def ding(): return sum(sine(f, 1.2) * np.exp(-tt(1.2) * (3 + k)) for k, f in enumerate((1046.5, 1318.5, 1568))) * .18
add(whoosh(.5, .6), 0.0); add(pop(700), .1)
add(scratch(), T['aprox'] - .15, 1.0)
add(suspense(T['lenta'] - T['aprox'] + .3), T['aprox'], .45)
add(whoosh(.8, .55), T['lenta'] - .2)
add(thud(), T['IMPACTO'], 1.3); add(boing(), T['IMPACTO'] + .05, .8)
add(crowd(1.8), T['chao'] + .05, .9)
add(whistle(), T['chao'] + 1.2, .9); add(ding(), T['chao'] + 1.35, 1.0)
add(whoosh(.4, .5), T['boi'] - .1); add(pop(600), T['boi'] + .1)
add(whoosh(.4, .5), T['riso'] - .1); add(pop(900), T['riso'] + .15)
add(scratch(), T['loop'] - .05, .8)
mix = np.tanh(mix * 1.1) / np.tanh(1.1); mix /= np.abs(mix).max() / .89
fo = int(.05 * SR); mix[-fo:] *= np.linspace(1, 0, fo)
with wave.open('out/audio_raw.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('ok', len(mix) / SR)
