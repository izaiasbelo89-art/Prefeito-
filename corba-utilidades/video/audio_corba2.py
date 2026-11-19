"""Trilha Corbã: música + efeitos + locução tratada (com ducking).
Gera out/audio.wav (44,1 kHz, estéreo). Tempos sincronizados com anim.js.
Música: 120 BPM. 0–18 s rotina com dificuldade (Lá menor, tensão crescente);
18–24 s virada (pads + subida); 24 s impacto na logo; 24–43,5 s tema positivo (Dó maior)."""
import numpy as np, wave
from scipy.signal import butter, sosfilt

SR = 44100
DUR = 92.0
N = int(SR * (DUR + 0.5))
rng = np.random.default_rng(7)
BEAT = 0.5  # 120 BPM


def tt(d):
    return np.arange(int(SR * d)) / SR


def lp(x, f, o=2):
    return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)


def bp(x, f1, f2, o=2):
    return sosfilt(butter(o, [f1, f2], 'band', fs=SR, output='sos'), x)


def env(n, a=0.005, r=0.2, sustain=False):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4))
    return e if sustain else e * np.exp(-t / r)


def saw(f, d):
    t = tt(d); ph = (t * f) % 1.0
    return 2 * ph - 1


def sq(f, d, duty=0.5):
    t = tt(d); return np.where((t * f) % 1.0 < duty, 1.0, -1.0)


def sine(f, d):
    return np.sin(2 * np.pi * f * tt(d))


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def add(buf, sig, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= len(buf): return
    s = sig[: len(buf) - i] * g
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    buf[i:i + len(s), 0] += s * l
    buf[i:i + len(s), 1] += s * r


music = np.zeros((N, 2))
sfx = np.zeros((N, 2))

# ---------------- instrumentos ----------------

def kick(g=1.0):
    d = 0.35; t = tt(d)
    f = 45 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * g


def snare(d=0.2):
    n = rng.standard_normal(int(SR * d))
    return (bp(n, 1200, 7000) * env(len(n), .001, .07) * .9 + sine(190, d) * env(int(SR * d), .001, .05) * .4)


def clap():
    n = rng.standard_normal(int(SR * .25)); e = np.zeros(len(n))
    for k in range(3): e[int(k * .011 * SR):] += np.exp(-np.arange(len(n) - int(k * .011 * SR)) / SR / (.012 if k < 2 else .09))
    return bp(n, 900, 5000) * e * .5


def hat(d=0.05, g=1.0):
    n = rng.standard_normal(int(SR * d)); return hp(n, 7000) * env(len(n), .0005, d / 4) * g


def bass_note(m, d, cut=500):
    s = saw(mtof(m), d) * .6 + sq(mtof(m - 12), d) * .4
    return lp(s, cut, 2) * env(len(s), .005, d * .7)


def pluck(m, d=0.25, cut=2800):
    s = saw(mtof(m), d) + saw(mtof(m) * 1.004, d)
    return lp(s, cut) * env(len(s), .002, .11) * .5


def pad(ms, d, cut=1200, a=0.4):
    s = np.zeros(int(SR * d))
    for m in ms:
        for det in (-0.07, 0.07):
            s += saw(mtof(m + det), d)
    s = lp(s, cut, 2) / (len(ms) * 2)
    e = np.minimum(1, tt(d) / a) * np.minimum(1, (d - tt(d)) / 0.3)
    return s * e


# ---------------- música (Ré maior, 116 BPM aprox. — compasso de 2 s) ----------------
prog = [(50, [62, 66, 69, 74]), (45, [61, 64, 69, 73]), (47, [59, 62, 66, 71]), (43, [59, 62, 67, 71])]
bar = 0; t0 = 0.0
while t0 < 89.6:
    root, ch = prog[bar % 4]
    full = t0 >= 2.0
    add(music, pad([c - 12 for c in ch[:3]], 2.05, cut=1600, a=.2), t0, .12)
    for k in range(8):
        add(music, bass_note(root - 12, .2, cut=800), t0 + k * .25, .22 if k % 2 == 0 else .16)
    if full:
        for k in range(4):
            add(music, kick(.55), t0 + k * .5, 1)
            add(music, hat(.05, .2), t0 + k * .5 + .25, 1, pan=.25)
        add(music, clap(), t0 + .5, .35); add(music, clap(), t0 + 1.5, .35)
        for k in range(16): add(music, hat(.02, .06), t0 + k * .125, 1, pan=-.3)  # chocalho
    pat = [0, 2, 1, 3, 0, 2, 3, 1, 0, 2, 1, 3, 2, 1, 3, 2]
    for k in range(16):
        if k % 2 == 0 or full:
            add(music, pluck(ch[pat[k]] + 12, .16, cut=3200), t0 + k * .125, .07, pan=-.35 if k % 2 else .35)
    bar += 1; t0 += 2.0
add(music, pad([50, 57, 62, 66, 69, 74], 1.8, cut=2600, a=.02), 89.6, .22)
add(music, sine(73.4, 1.8) * env(int(SR * 1.8), .01, .9), 89.6, .25)
# ---------------- EFEITOS SONOROS ----------------

def s_notif():
    s = np.zeros(int(SR * .7))
    for k, (f, t0) in enumerate([(1318.5, 0), (1760, .11)]):
        x = (sine(f, .55) + .25 * sine(f * 2, .55)) * env(int(SR * .55), .002, .16)
        i = int(t0 * SR); s[i:i + len(x)] += x
    return s * .5


def s_click():
    n = rng.standard_normal(int(SR * .03)); return (hp(n, 2000) * env(len(n), .0003, .006) + sine(2200, .03) * env(int(SR * .03), .0003, .004) * .5) * .8


def s_tick(g=1.0):
    return (sine(3200, .025) * env(int(SR * .025), .0003, .004) + hp(rng.standard_normal(int(SR * .025)), 4000) * env(int(SR * .025), .0003, .003) * .4) * .5 * g


def s_whoosh(d=.45, f1=600, f2=4000, g=.5):
    n = rng.standard_normal(int(SR * d)); t = tt(d)
    lo = lp(n, f2) - lp(n, f1)
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return lo * e * g


def s_pop(f=900):
    d = .12; t = tt(d); fr = f * (1 + 1.2 * np.exp(-t * 40))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(int(SR * d), .001, .035) * .45


def s_error():
    s = np.zeros(int(SR * .5))
    for k, f in enumerate([330, 247]):
        x = (sq(f, .16, .35) * .4 + sine(f, .16)) * env(int(SR * .16), .002, .07)
        x = lp(x, 2500); i = int(k * .17 * SR); s[i:i + len(x)] += x
    return s * .35


def s_glitch():
    d = .45; t = tt(d); f = 900 * np.exp(-t * 4)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (sq(28, d) > 0) * env(int(SR * d), .002, .2)
    return x * .3


def s_confirm():
    s = np.zeros(int(SR * .8))
    for k, f in enumerate([1046.5, 1318.5, 1568]):
        x = (sine(f, .6) + .2 * sine(f * 2, .6)) * env(int(SR * .6), .002, .2)
        i = int(k * .07 * SR); s[i:i + len(x)] += x
    return s * .3


def s_impact():
    d = 2.5; t = tt(d)
    boom = np.sin(2 * np.pi * np.cumsum(40 + 80 * np.exp(-t * 12)) / SR) * np.exp(-t * 2.2)
    n = rng.standard_normal(len(t)); cym = hp(n, 5000) * np.exp(-t * 1.8) * .25
    shimmer = sum(sine(f, d) * np.exp(-t * 1.5) for f in (1046.5, 1568, 2093)) * .06
    return (boom * .9 + cym + shimmer)


def s_roll(d=1.1):
    n = rng.standard_normal(int(SR * d)); t = tt(d)
    x = lp(n, 500) * (0.6 + .4 * (np.sin(2 * np.pi * 14 * t) > 0)) * np.minimum(1, t / .2) * np.minimum(1, (d - t) / .2)
    return x * .5


def s_paper():
    d = .5; n = rng.standard_normal(int(SR * d)); t = tt(d)
    return bp(n, 2000, 8000) * (np.abs(np.sin(2 * np.pi * 9 * t)) ** 3) * np.exp(-t * 3) * .3


def s_sweep_up():
    d = .8; t = tt(d); f = 300 * 2 ** (t / d * 2.5)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * .18


def s_blip(f=1500):
    return sine(f, .07) * env(int(SR * .07), .001, .02) * .3


def s_chime():
    d = 1.6; t = tt(d)
    return sum((sine(f, d) * np.exp(-t * (2.5 + k))) for k, f in enumerate([784, 1046.5, 1318.5, 1568])) * .12


def s_sizzle(d=1.6):
    n = rng.standard_normal(int(SR * d)); t_ = tt(d)
    crackle = (rng.random(len(n)) > .996) * rng.standard_normal(len(n)) * 3
    x = hp(n * .4 + crackle, 3000) * np.minimum(1, t_ / .05) * np.exp(-t_ * 1.4)
    return x * .35

def s_engine(d):
    t_ = tt(d); f = 55 + 10 * np.sin(2 * np.pi * .4 * t_) + 15 * np.minimum(1, t_ / 1.5)
    x = lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .5 + rng.standard_normal(len(t_)) * .1, 400)
    e = np.minimum(1, t_ / .3) * np.minimum(1, (d - t_) / .4)
    return x * e * .35
def s_hooves(d):
    out = np.zeros(int(SR * d)); k = 0; t0 = 0.0
    while t0 < d - .1:
        for off, g in ((0, 1), (.09, .7), (.17, .85)):           # ritmo de galope (três batidas)
            n = int(SR * .05); x = bp(rng.standard_normal(n), 300, 2500) * np.exp(-np.arange(n) / SR / .012) + sine(180, .05) * np.exp(-np.arange(n) / SR / .02) * .6
            i = int((t0 + off) * SR); seg = out[i:i + n]; seg += x[:len(seg)] * g
        t0 += .38
    e = np.minimum(1, np.arange(len(out)) / SR / .2) * np.minimum(1, (d - np.arange(len(out)) / SR) / .3)
    return out * e * .5
import json as _js
WD = _js.load(open('words.json'))
def WT(w, after=0): return next((d['t0'] for d in WD if d['w'] == w and d['t0'] >= after), 0)
E = []
E += [(0.2, s_whoosh(1.0, 300, 4000, .3), 1), (0.95, s_pop(700), .8)]                      # guia entra e acena
E += [(5.9, s_whoosh(.8, 500, 7000, .5), 1), (6.0, s_chime(), .7)]                           # íris para o mapa
E += [(7.1, s_click(), 1), (7.15, s_blip(1300), 1), (8.5, s_whoosh(.5, 500, 5000, .35), 1), (8.85, s_pop(600), 1)]
E += [(9.75, s_whoosh(.6, 400, 6000, .45), 1), (11.8, s_whoosh(.4, 600, 6000, .3), 1)]
E += [(14.6, s_whoosh(.5, 500, 5000, .4), 1), (15.3, s_pop(700), 1)] + [(15.8 + k * .17, s_tick(.6), 1) for k in range(7)] + [(17.0, s_pop(900), 1), (WT('abriu'), s_notif(), .5)]
E += [(20.7, s_whoosh(.5, 500, 5000, .4), 1), (WT('caminhar') - .6, s_whoosh(1.4, 600, 5000, .25), 1), (WT('caminhar') + 1.0, s_pop(800), 1)]
E += [(26.6, s_whoosh(.5, 400, 5000, .4), 1)] + [(WT(w, 26) - .05, s_pop(700 + i * 120), 1) for i, w in enumerate(('quatro', 'fabricação', 'centro', 'variedade'))]
E += [(33.6, s_whoosh(.5, 400, 5000, .4), 1), (34.1, s_engine(1.3), .8), (35.3, s_notif(), .6), (35.6, s_whoosh(.5, 600, 6000, .35), 1), (WT('Santos') - .1, s_pop(700), .8)]
E += [(37.9, s_whoosh(1.2, 300, 5000, .35), 1), (38.9, s_whoosh(.5, 800, 8000, .45), 1)]
E += [(39.6, s_whoosh(.4, 600, 5000, .3), 1)] + [(WT(w) - .05, s_whoosh(.35, 1000, 7000, .25), 1) for w in ('panelas', 'utensílios', 'organização,', 'decoração,', 'cama,')]
E += [(WT('panelas') + .35, s_pop(500), 1)] + [(WT('utensílios') + .4 + d, s_tick(.9), 1) for d in (0, .25, .45)] + [(WT('organização,') + .35 + d, s_pop(600 + d * 400), 1) for d in (0, .3, .6)]
E += [(WT('decoração,') + .4, s_sweep_up(), .7), (WT('cama,') + .2, s_pop(900), .8), (46.0, s_whoosh(.5, 400, 5000, .4), 1), (48.4, s_notif(), .55)]
E += [(52.8, s_whoosh(.5, 400, 5000, .4), 1), (53.1, s_click(), 1), (53.15, s_blip(1300), 1), (53.3, s_engine(1.4), .7), (54.85, s_whoosh(.5, 500, 5000, .35), 1), (WT('duas') - .1, s_pop(800), 1)]
E += [(56.6, s_whoosh(.5, 400, 5000, .4), 1), (57.0, s_engine(1.5), .8), (58.5, s_notif(), .6), (59.5, s_whoosh(.8, 300, 6000, .5), 1), (WT('Padre') - .45, s_pop(700), .8)]
E += [(63.0, s_whoosh(.5, 400, 5000, .4), 1), (63.25, s_engine(1.1), .8), (64.3, s_notif(), .6), (64.85, s_pop(700), .8)]
E += [(67.0, s_whoosh(.5, 400, 5000, .4), 1), (67.2, s_engine(4.5), .5), (67.3, s_pop(700), .8)]
E += [(72.4, s_whoosh(.5, 400, 5000, .4), 1), (72.6, s_click(), 1), (72.65, s_blip(1300), 1), (72.8, s_engine(1.4), .7), (WT('agosto') - .1, s_pop(600), 1)]
E += [(74.45, s_whoosh(.5, 500, 5000, .35), 1), (75.85, s_whoosh(.5, 400, 5000, .4), 1), (76.1, s_engine(.8), .8), (76.9, s_notif(), .6), (77.55, s_pop(700), .8)]
E += [(80.7, s_whoosh(.6, 400, 5000, .4), 1)] + [(80.9 + k * .25, s_pop(700 + k * 120), .9) for k in range(3)]
E += [(WT('quinta') - .1, s_sweep_up(), 1), (WT('Onde?') - .05, s_pop(500), 1.1), (WT('breve.') - .55, s_blip(1600), 1)]
E += [(86.6, s_whoosh(.7, 400, 6000, .45), 1), (86.75, s_impact(), .35), (86.8, s_chime(), 1), (WT('merece') - .5, s_pop(900), 1), (89.9, s_pop(700), .8)]
for t0, s, g in E: add(sfx, s, t0, g)
# ---------------- locução + ducking ----------------
import wave as _w
with _w.open('../audio/locucao-final.wav') as w:
    ch_ = w.getnchannels(); v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
v = v.reshape(-1, ch_).mean(axis=1)
voice = np.zeros(N); voice[:len(v)] = v[:N]
venv = lp(np.abs(voice), 6, 1); venv = venv / venv.max()
duck = 1 - .55 * np.clip(venv * 4, 0, 1)
duck = lp(duck, 3, 1)
m = music / np.abs(music).max() * .30 * duck[:, None]
s = sfx / np.abs(sfx).max() * .38
vo = voice / np.abs(voice).max() * .92
mix = m + s + vo[:, None]
t_ = np.arange(N) / SR
mix *= np.clip((DUR - t_) / 1.0, 0, 1)[:, None]
mix = mix[: int(SR * DUR)]
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix /= np.abs(mix).max() / .89
pcm = (mix * 32767).astype(np.int16)
with _w.open('out/audio_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', len(pcm) / SR)
