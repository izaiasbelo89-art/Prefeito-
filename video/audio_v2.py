"""Trilha original (música + efeitos) sintetizada para o vídeo da TC Soluções.
Versão 2: gera out/audio_v2_raw.wav.
Música: 120 BPM. 0–18 s rotina com dificuldade (Lá menor, tensão crescente);
18–24 s virada (pads + subida); 24 s impacto na logo; 24–43,5 s tema positivo (Dó maior)."""
import numpy as np, wave
from scipy.signal import butter, sosfilt

SR = 44100
DUR = 44.0
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


# ======================= VERSÃO 2 =======================
# A (0–6,4): abertura curiosa, acelerando · B (6,4–17,8): problemas, Lá menor, tensão
# impacto 17,8 (logo) · C (17,8–42): tema positivo em Dó maior · acorde final 42,2
chC = {48: [60, 64, 67], 43: [59, 62, 67], 45: [57, 60, 64], 41: [57, 60, 65]}
for b in range(4):  # Parte A
    t0 = b * 1.6; root = [48, 41, 45, 43][b]
    add(music, pad([c - 12 for c in chC[root]], 1.65, cut=1400, a=.3), t0, .16)
    st = .2 if b < 2 else .1
    for k in range(int(1.6 / st)):
        add(music, pluck(chC[root][k % 3] + 12, .16, cut=2600), t0 + k * st, .07, pan=-.3 if k % 2 else .3)
        add(music, hat(.035, .12 + .05 * b), t0 + k * st, 1)
    for k in range(4): add(music, bass_note(root - 12, .2, cut=600), t0 + k * .4, .26)
    if b >= 2:
        for k in range(4): add(music, kick(.5), t0 + k * .4, 1)
add(music, hp(rng.standard_normal(int(SR * 1.2)), 3000) * np.linspace(0, 1, int(SR * 1.2)) ** 2 * .1, 5.2)
progA = [57, 53, 57, 52, 50, 52]
chordsA = {57: [57, 60, 64], 53: [53, 57, 60], 52: [52, 56, 59], 50: [50, 53, 57]}
for b, root in enumerate(progA):  # Parte B
    t0 = 6.4 + b * 2.0; inten = b / 5
    add(music, pad(chordsA[root], 2.05, cut=700 + 700 * inten, a=.4), t0, .16 + .06 * inten)
    for k in range(8): add(music, bass_note(root - 24, .24, cut=320 + 300 * inten), t0 + k * .25, .34)
    stp = .25 if b < 3 else .125
    for k in range(int(2 / stp)): add(music, hat(.04, .16 + .12 * inten), t0 + k * stp, 1, pan=.3 if k % 2 else -.3)
    add(music, kick(.55), t0, 1); add(music, kick(.4), t0 + 1.25, 1)
    if b >= 2: add(music, kick(.5), t0 + 1.0, 1)
    notes = chordsA[root] + [chordsA[root][0] + 12]
    for k in range(8 if b < 3 else 16):
        st = .25 if b < 3 else .125
        add(music, pluck(notes[k % 4] + 12, .2, cut=1500 + 1200 * inten), t0 + k * st, .07 + .05 * inten, pan=-.4 if k % 2 else .4)
for k in range(16): add(music, snare(.12), 16.8 + k / 16, .12 + .35 * k / 16)
d = 2.4; t_ = tt(d); f = 200 * 2 ** (t_ / d * 3)
add(music, lp(np.sin(2 * np.pi * np.cumsum(f) / SR) * (t_ / d) ** 2, 4000) * .1, 15.4)
add(music, bp(rng.standard_normal(int(SR * d)), 1500, 9000) * (t_ / d) ** 3 * .16, 15.4)
progC = [(48, [60, 64, 67, 72]), (43, [59, 62, 67, 71]), (45, [57, 60, 64, 69]), (41, [57, 60, 65, 69])]
bar = 0; t0 = 17.8
while t0 < 42.0:  # Parte C
    root, ch = progC[bar % 4]
    soft = 1 if t0 >= 19.8 else .55
    add(music, pad([c - 12 for c in ch[:3]], 2.05, cut=1800, a=.15), t0, .14)
    for k in range(8): add(music, bass_note(root - 12, .22, cut=900), t0 + k * .25, (.3 if k % 2 == 0 else .22) * soft)
    if t0 >= 19.8:
        for k in range(4):
            add(music, kick(.7), t0 + k * .5, 1); add(music, hat(.05, .28), t0 + k * .5 + .25, 1, pan=.25)
        add(music, clap(), t0 + .5, .55); add(music, clap(), t0 + 1.5, .55)
    pat = [0, 2, 1, 3, 2, 1, 3, 2, 0, 2, 1, 3, 2, 3, 1, 2]
    for k in range(16): add(music, pluck(ch[pat[k]] + 12, .18, cut=3500), t0 + k * .125, .085 * soft, pan=-.35 if k % 2 else .35)
    if bar % 2 == 1:
        for k, m in enumerate([ch[3] + 12, ch[2] + 12, ch[3] + 12, ch[1] + 24]):
            add(music, (sine(mtof(m), .4) + .3 * sine(mtof(m) * 2, .4)) * env(int(SR * .4), .005, .18), t0 + k * .5 + .25, .06)
    bar += 1; t0 += 2.0
add(music, pad([48, 55, 60, 64, 67, 72], 1.8, cut=2500, a=.02), 41.8, .26)
add(music, kick(.8), 41.8, 1)
add(music, sine(65.4, 1.8) * env(int(SR * 1.8), .01, .9), 41.8, .3)
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


E = []
E += [(0.2, s_whoosh(1.4, 300, 3000, .35), 1)]
E += [(2.3, s_whoosh(1.0, 400, 5000, .5), 1), (2.4, s_pop(500), 1), (2.6, s_pop(650), 1)]
for k, tk in enumerate([3.6, 4.1, 4.5, 4.85, 5.15, 5.4, 5.62, 5.82, 6.0, 6.15, 6.28]):
    E += [(tk, [s_click(), s_blip(1200 + 80 * k), s_tick(.7)][k % 3], 1)]
for i in range(4):
    t0 = 6.4 + i * 2.0
    E += [(t0 - .05, s_whoosh(.5, 500, 5000, .4), 1), (t0 + .1, s_pop(800), 1)]
E += [(6.75, s_notif(), .7)]
for k in range(8): E += [(7.0 + k * .16, s_tick(.5), 1)]
E += [(7.6, s_click(), 1), (8.0, s_click(), 1)]
E += [(8.9, s_error(), .8)]
for k in range(4): E += [(9.3 + k * .3, s_tick(.6), 1)]
E += [(10.9, s_error(), .8), (11.3, s_blip(700), 1), (11.7, s_blip(700), 1)]
E += [(12.9, s_paper(), 1), (13.5, s_paper(), .8), (14.0, s_glitch(), .8)]
E += [(14.4, s_whoosh(.8, 300, 4000, .5), 1)]
for k in range(20): E += [(14.6 + k * .12, s_pop(400 + (k % 5) * 60), .45)]
for i in range(4): E += [(14.9 + i * .38, s_error(), .55)]
tk = 15.4
while tk < 17.6: E += [(tk, s_tick(.5 + .4 * (tk - 15.4) / 2.2), 1)]; tk += max(.1, .35 - .1 * (tk - 15.4))
E += [(17.8, s_impact(), 1.0)]
E += [(19.0, s_whoosh(.5, 600, 5000, .35), 1), (19.35, s_sweep_up(), 1), (19.9, s_blip(1500), 1), (20.4, s_blip(1700), 1)]
for i in range(4):
    t0 = 21.0 + i * 2.4
    if i: E += [(t0 - .05, s_whoosh(.45, 700, 6000, .4), 1)]
    E += [(t0 + .08, s_pop(900), 1)]
for k in range(3): E += [(22.0 + k * .3, s_blip(1200 + k * 200), 1.2)]
E += [(24.0, s_sweep_up(), 1), (24.4, s_blip(1600), 1), (24.7, s_blip(1800), 1)]
E += [(26.2, s_notif(), .4), (26.7, s_click(), 1), (27.45, s_confirm(), 1)]
for k in range(5): E += [(28.75 + k * .32, s_pop(1100 + k * 90), .7)]
E += [(30.6, s_whoosh(.7, 400, 5000, .45), 1), (30.7, s_sweep_up(), 1)]
for tk in (31.0, 31.95, 33.85): E += [(tk, s_confirm(), 1)]
E += [(32.35, s_sweep_up(), .8), (32.9, s_confirm(), 1), (34.4, s_blip(1500), 1)]
E += [(35.0, s_whoosh(.9, 300, 4000, .35), 1)]
for tk in (36.0, 37.25, 38.5): E += [(tk, s_whoosh(.8, 300, 3500, .3), 1)]
E += [(40.0, s_whoosh(.6, 400, 6000, .4), 1), (40.15, s_chime(), 1), (40.8, s_pop(800), 1)]
for t0, s, g in E:
    add(sfx, s, t0, g)

# ---------------- mixagem ----------------
# música mais baixa sob os efeitos; leve "ducking" no impacto
m = music.copy()
m = lp(m.T, 12000).T
mx = np.abs(m).max(); m = m / mx * 0.42
s = sfx / max(1e-9, np.abs(sfx).max()) * 0.62
mix = m + s
# fade final
t = np.arange(N) / SR
fade = np.clip((DUR - t) / 1.2, 0, 1)
fade_in = np.clip(t / 0.05, 0, 1)
mix *= (fade * fade_in)[:, None]
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix = mix[: int(SR * DUR)]
mix /= np.abs(mix).max() / 0.89
pcm = (mix * 32767).astype(np.int16)
with wave.open('out/audio_v2_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', len(pcm) / SR, 's')
