"""Trilha do meme v5: áudio original + trilhas e efeitos criados do zero (sem material de terceiros).
Trailer épico, música de perseguição na corrida acelerada, coração no 'momento', boom/erro/game over nos travamentos,
narrador desacelerado no replay, buzina do ZERO, trombone triste no boi, riff de 'continua'."""
import numpy as np, wave, json
from scipy.signal import butter, sosfilt, resample
SR = 44100; T = json.load(open('tempos.json')); DUR = T['DUR']; N = int(SR * DUR); rng = np.random.default_rng(7)
def rd(f): w = wave.open(f); return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(SR * d)) / SR
def env(n, a, r): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def sq(f, d, duty=.5): return np.where((tt(d) * f) % 1 < duty, 1., -1.)
def saw(f, d): return 2 * ((tt(d) * f) % 1) - 1
def sine(f, d): return np.sin(2 * np.pi * f * tt(d))
voz = np.zeros(N); mus = np.zeros(N); fx = np.zeros(N)
def add(buf, x, t0, g=1.0):
    i = int(t0 * SR)
    if i >= N or i + len(x) <= 0: return
    if i < 0: x = x[-i:]; i = 0
    seg = buf[i:i + len(x)]; seg += x[:len(seg)] * g
def fade(x, fi=.01, fo=.02):
    x = x.copy(); a, b = int(fi * SR), int(fo * SR); x[:a] *= np.linspace(0, 1, a); x[-b:] *= np.linspace(1, 0, b); return x
full = rd('out/orig_full.wav'); riso = rd('out/orig_riso.wav')
cut = lambda a, b: full[int(a * SR):int(b * SR)]
TL = T['TL']; S = {s['tag']: s for s in TL}
F1 = [s for s in TL if s['tag'] == 'f1'][0]; F2 = [s for s in TL if s['tag'] == 'f2'][0]; F3 = [s for s in TL if s['tag'] == 'f3'][0]

# ---- voz/ambiente original ----
for s in TL:
    if s['k'] != 'play' or s['v'] < 0 or s['tag'] in ('trailer', 'fast', 'momento'): continue
    x = cut(s['a'], s['b'])
    if s['v'] != 1: x = lp(resample(x, int(len(x) / s['v'])), 3200 if s['v'] > .3 else 2200)
    add(voz, fade(x), s['t0'], 1.5 if s['tag'] == 'replay' else 1.3)
add(voz, fade(cut(27.1, 28.9 * 1 + .4), .05, .2), T['boi'], 1.0)
add(voz, fade(riso, .05, .3), T['riso'], 2.4)

# ---- instrumentos ----
def boom(g=1.):
    d = 1.4; t = tt(d); f = 38 + 85 * np.exp(-t * 9)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6) + lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 18) * .5
    return np.tanh(x * 1.6) * .9 * g
def braam(root=36):
    d = 1.6; x = sum(lp(saw(mtof(root + i), d) + saw(mtof(root + i) * 1.006, d), 500) for i in (0, 7, 12, 15))
    y = np.tanh(x * .5) * env(int(SR * d), .03, .9) * .5; bb = boom(.6); y[:len(bb)] += bb[:len(y)]; return y
def pluck(m, d=.15, duty=.3): return lp(sq(mtof(m), d, duty), 3500) * env(int(SR * d), .002, .06) * .35
def kick(): d = .25; t = tt(d); return np.sin(2 * np.pi * np.cumsum(50 + 100 * np.exp(-t * 30)) / SR) * np.exp(-t * 12)
def snare(): n = rng.standard_normal(int(SR * .15)); return hp(n, 1500) * env(len(n), .001, .05) * .6
def heart(): return (kick() * .9)[:int(SR * .25)]
def scratch():
    d = .45; t = tt(d); f = 400 + 1600 * np.abs(np.sin(2 * np.pi * 5 * t)); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .5 + lp(rng.standard_normal(len(t)), 5000) * .6
    return x * env(len(t), .005, .25) * .7
def whoosh(d=.4, g=.45): n = rng.standard_normal(int(SR * d)); t = tt(d); return (lp(n, 6000) - lp(n, 500)) * np.sin(np.pi * t / d) ** 2 * g
def rewind(d):
    t = tt(d); f = 900 + 2600 * (t / d); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * .25 + (lp(rng.standard_normal(len(t)), 7000) - lp(rng.standard_normal(len(t)), 1500)) * .5
    return x * (.6 + .4 * np.sin(2 * np.pi * 22 * t)) * np.minimum(1, t / .03) * np.minimum(1, (d - t) / .05) * .6
def ding(): return sum(sine(f, 1.0) * np.exp(-tt(1.0) * (3 + k)) for k, f in enumerate((1046.5, 1318.5, 1568))) * .25
def erro():
    out = np.zeros(int(SR * .6))
    for k, f in enumerate((587, 392)): x = lp(sq(f, .22, .5), 3000) * env(int(SR * .22), .003, .25); i = int(k * .2 * SR); out[i:i + len(x)] += x
    return out * .35
def gameover():
    out = np.zeros(int(SR * 2.0))
    for k, m in enumerate((67, 66, 65, 64)): d = .2 if k < 3 else 1.0; x = lp(sq(mtof(m), d, .5), 2500) * env(int(SR * d), .005, .5 if k == 3 else .2); i = int(k * .22 * SR); out[i:i + len(x)] += x
    return out * .3
def buzina(): d = .75; return np.tanh(lp(sq(110, d, .5) + sq(116, d, .5), 1800) * 1.5) * np.minimum(1, (d - tt(d)) / .05) * .35
def trombone():
    out = np.zeros(int(SR * 2.6)); notes = [(55, .45), (54, .45), (53, .45), (52, 1.2)]; t0 = 0
    for k, (m, d) in enumerate(notes):
        t = tt(d); f = mtof(m) * (1 + (.03 * np.sin(2 * np.pi * 6 * t) if k == 3 else 0))
        x = np.sin(2 * np.pi * np.cumsum(f) / SR); x = sum(np.sin(2 * np.pi * np.cumsum(f * h) / SR) / h for h in range(1, 7))
        cut_ = 600 + 1400 * np.abs(np.sin(np.pi * t / d))
        x = lp(x, 1500) * np.minimum(1, t / .04) * np.minimum(1, (d - t) / .08)
        i = int(t0 * SR); out[i:i + len(x)] += x; t0 += d
    return out * .3
def riffContinua():
    out = np.zeros(int(SR * 1.6)); seq = [(40, 0), (43, .18), (45, .36), (47, .54), (48, .72)]
    for m, st in seq: x = np.tanh(lp(saw(mtof(m), .3), 1200) * 2) * env(int(SR * .3), .005, .2); i = int(st * SR); out[i:i + len(x)] += x
    return out * .4

# ---- música ----
# trailer épico: drone + braam a cada cartela
tr = S['trailer']; d = tr['t1'] - tr['t0']
dr = lp(saw(mtof(36), d) + saw(mtof(43), d) * .7, 300) * np.minimum(1, tt(d) / .4) * .25; add(mus, dr, tr['t0'])
for k in range(4): add(mus, braam(36 if k < 3 else 31), tr['t0'] + k * d / 4, .9 if k < 3 else 1.1)
# perseguição (corrida acelerada): 168 bpm, colcheias
fa = S['fast']; e = 60 / 168 / 2; mel = [72, 74, 76, 77, 79, 77, 76, 74, 72, 76, 79, 84, 79, 76, 72, 67]
n = int((fa['t1'] - fa['t0']) / e)
for i in range(n):
    t0 = fa['t0'] + i * e; add(mus, pluck(mel[i % 16], .16), t0, 1.0)
    add(mus, pluck((48 if (i // 8) % 2 == 0 else 43) - (0 if i % 2 == 0 else -7), .14, .5), t0, .8)
    if i % 2 == 0: add(mus, kick(), t0, .55)
    if i % 4 == 2: add(mus, snare(), t0, .5)
# narração: tensão leve por baixo
na = S['narra']; d = na['t1'] - na['t0']; add(mus, lp(saw(mtof(38), d) + saw(mtof(38.1), d), 220) * np.minimum(1, tt(d) / 1) * .12, na['t0'])
# momento: silêncio + coração
mo = S['momento']; k = mo['t0']
while k < mo['t1'] - .2: add(fx, heart(), k, .9); add(fx, heart(), k + .2, .6); k += .78

# ---- efeitos ----
add(fx, scratch(), 0.0, .8)
hk = [s for s in TL if s['tag'] == 'hook' and s['k'] == 'freeze'][0]; add(fx, boom(), hk['t0'])
rw = S['rewind']; add(fx, rewind(rw['t1'] - rw['t0'] + .05), rw['t0'])
add(fx, whoosh(.5), fa['t0'] - .1); add(fx, whoosh(.4), na['t0'] - .1)
add(fx, pluck(88, .1) * 2, na['t0'] + 2.4, .6)  # mira travando
add(fx, boom(), F1['t0']); add(fx, ding(), F1['t0'] + .2, .9)
add(fx, boom(), F2['t0']); add(fx, erro(), F2['t0'] + .1, 1.0)
add(fx, boom(1.1), F3['t0']); add(fx, gameover(), F3['t0'] + .15, 1.0)
rp = S['replay']; add(fx, whoosh(.6), rp['t0'] - .15)
ch = S['chao']; add(fx, buzina(), ch['t0'] + .02, 1.0)
add(fx, trombone(), T['boi'] + .1, 1.0)
add(fx, whoosh(.35, .4), T['riso'] - .12)
add(fx, scratch(), T['cont'] - .05, .7); add(fx, riffContinua(), T['cont'] + .05, 1.0)

mix = voz + mus * .55 + fx
mix = np.tanh(mix * 1.1) / np.tanh(1.1); mix /= np.abs(mix).max() / .89; mix[-int(.1 * SR):] *= np.linspace(1, 0, int(.1 * SR))
with wave.open('out/audio_raw.wav', 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print('ok', len(mix) / SR)
