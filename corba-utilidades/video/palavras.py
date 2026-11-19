"""Tempo de cada palavra: distribui as sílabas de cada frase sobre o tempo com voz (ignorando pausas). Gera words.json e legendas.json."""
import json, re, wave, numpy as np
T = json.load(open('timing.json'))
w = wave.open('../audio/locucao-final.wav'); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768; sr = w.getframerate()
h = int(.01 * sr); voiced = np.array([20 * np.log10(np.sqrt(np.mean(x[i:i + h] ** 2)) + 1e-9) >= -40 for i in range(0, len(x) - h, h)])
syl = lambda s: max(1, len(re.findall(r'[aeiouáéíóúâêôãõà]+', s.lower().replace('qu', 'q').replace('gu', 'g'))))
words = []
for s in T:
    toks = s['txt'].split(); S = [syl(t) for t in toks]; tot = sum(S)
    a, b = int(s['t0'] * 100), int(s['t1'] * 100); idx = [i for i in range(a, min(b, len(voiced))) if voiced[i]]
    if not idx: idx = list(range(a, b))
    acc = 0
    for tok, n in zip(toks, S):
        i0 = idx[min(len(idx) - 1, int(acc / tot * len(idx)))]; acc += n; i1 = idx[min(len(idx) - 1, int(acc / tot * len(idx)) - 1)]
        words.append({'w': tok, 't0': round(i0 / 100, 2), 't1': round((i1 + 1) / 100, 2)})
json.dump(words, open('words.json', 'w'), ensure_ascii=False, indent=0)
# legendas: blocos curtos (até 4 palavras / 24 caracteres), quebra em pontuação
caps = []; cur = []
for wd in words:
    cur.append(wd); txt = ' '.join(c['w'] for c in cur)
    if wd['w'][-1] in '.,?!' or len(cur) >= 4 or len(txt) >= 24:
        caps.append(cur); cur = []
if cur: caps.append(cur)
json.dump([{'t0': c[0]['t0'], 't1': c[-1]['t1'], 'w': [[d['w'], d['t0']] for d in c]} for c in caps], open('legendas.json', 'w'), ensure_ascii=False)
print(len(words), 'palavras,', len(caps), 'legendas')
for k in ('Corbã?', 'antes', 'Iguatu,', 'indústria,', 'alumínio.', 'janeiro', 'abriu', 'experiência', 'quatro', 'fabricação', 'centro', 'variedade', 'Santos', 'Bora', 'panelas', 'utensílios', 'organização,', 'decoração,', 'cama,', 'Juazeiro', 'duas', 'Atacarejo,', 'dezoito,', 'Padre', 'outra', 'São', 'distribuição,', 'agosto', 'Senador', 'quarta', 'Avenida', 'continua.', 'quinta', 'Onde?', 'breve.', 'Utilidades.', 'merece'):
    hits = [f"{d['t0']}" for d in words if d['w'] == k]; print(f'{k}: {", ".join(hits)}')
