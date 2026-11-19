"""Alinha frases do texto às pausas da locução original e converte para o tempo da locução tratada (warp.json)."""
import re, wave, numpy as np, json
txt = open('texto.txt').read().replace('\n', ' ')
sents = [c.strip() for c in re.findall(r'[^.?!]+[.?!]', txt)]
syl = lambda s: len(re.findall(r'[aeiouáéíóúâêôãõà]+', s.lower().replace('qu', 'q').replace('gu', 'g')))
S = np.array([syl(c) for c in sents], float)
w = wave.open('../audio/locucao-original-recortada.wav'); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768; sr = w.getframerate()
h = int(.01 * sr); db = np.array([20 * np.log10(np.sqrt(np.mean(x[i:i + h] ** 2)) + 1e-9) for i in range(0, len(x) - h, h)])
voiced = db >= -40
cum = np.concatenate([[0], np.cumsum(voiced)]) * .01
V = lambda a, b: cum[int(b * 100)] - cum[int(a * 100)]
gaps = []; i = 0
while i < len(voiced):
    if not voiced[i]:
        j = i
        while j < len(voiced) and not voiced[j]: j += 1
        if (j - i) >= 15 and i > 5 and j < len(voiced) - 5: gaps.append((i * .01, j * .01))
        i = j
    else: i += 1
start = np.argmax(voiced) * .01; end = (len(voiced) - np.argmax(voiced[::-1])) * .01
rate = S.sum() / V(start, end)
n, m = len(sents), len(gaps); INF = 1e18
def c(t0, t1, s): e = s / rate; return ((V(t0, t1) - e) / e) ** 2 * s
cost = np.full((n, m), INF); back = np.zeros((n, m), int)
for g in range(m): cost[0][g] = c(start, gaps[g][0], S[0]) - .3 * (gaps[g][1] - gaps[g][0])
for k in range(1, n - 1):
    for g in range(k, m):
        for gp in range(k - 1, g):
            v = cost[k - 1][gp] + c(gaps[gp][1], gaps[g][0], S[k]) - .3 * (gaps[g][1] - gaps[g][0])
            if v < cost[k][g]: cost[k][g] = v; back[k][g] = gp
best, bg = INF, -1
for g in range(n - 2, m):
    v = cost[n - 2][g] + c(gaps[g][1], end, S[n - 1])
    if v < best: best, bg = v, g
idx = [0] * (n - 1); idx[-1] = bg
for k in range(n - 2, 0, -1): idx[k - 1] = back[k][idx[k]]
t0s = [start] + [gaps[g][1] for g in idx]; t1s = [gaps[g][0] for g in idx] + [end]
W = json.load(open('warp.json'))
def fw(t):
    for (o0, n0), (o1, n1) in zip(W, W[1:]):
        if t <= o1: return n0 + (t - o0) * (n1 - n0) / (o1 - o0) if o1 > o0 else n0
    return W[-1][1]
out = [{'o0': round(a, 2), 'o1': round(b, 2), 't0': round(fw(a), 2), 't1': round(fw(b), 2), 'txt': s} for a, b, s in zip(t0s, t1s, sents)]
json.dump(out, open('timing.json', 'w'), ensure_ascii=False, indent=1)
for o in out: print(f"{o['t0']:6.2f}-{o['t1']:6.2f}  ({o['o0']:5.2f})  {o['txt']}")
