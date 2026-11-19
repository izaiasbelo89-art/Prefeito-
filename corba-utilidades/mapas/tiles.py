"""Monta imagens de mapa (tiles OpenStreetMap) para cada trajeto e para a visão da cidade. Gera mapas/*.png e mapas.json."""
import json, math, os, subprocess, time
from PIL import Image
UA = 'video-map-builder/1.0'; os.makedirs('tiles', exist_ok=True)
def px(lat, lon, z):
    n = 2 ** z * 256; x = (lon + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return x, y
def tile(z, x, y):
    f = f'tiles/{z}_{x}_{y}.png'
    if not os.path.exists(f):
        subprocess.run(['curl', '-s', '-m', '30', '-A', UA, '-o', f, f'https://tile.openstreetmap.org/{z}/{x}/{y}.png'], check=True); time.sleep(.08)
    return Image.open(f).convert('RGB')
def stitch(name, pts, z, mx, my, minw=1080, minh=1920):
    xs, ys = zip(*[px(a, b, z) for a, b in pts])
    x0, x1, y0, y1 = min(xs) - mx, max(xs) + mx, min(ys) - my, max(ys) + my
    cxm, cym = (x0 + x1) / 2, (y0 + y1) / 2
    if x1 - x0 < minw: x0, x1 = cxm - minw / 2, cxm + minw / 2
    if y1 - y0 < minh: y0, y1 = cym - minh / 2, cym + minh / 2
    tx0, ty0, tx1, ty1 = int(x0 // 256), int(y0 // 256), int(x1 // 256), int(y1 // 256)
    im = Image.new('RGB', ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
    for tx in range(tx0, tx1 + 1):
        for ty in range(ty0, ty1 + 1): im.paste(tile(z, tx, ty), ((tx - tx0) * 256, (ty - ty0) * 256))
    im.save(f'{name}.png'); print(name, im.size, (tx1 - tx0 + 1) * (ty1 - ty0 + 1), 'tiles')
    return {'img': f'{name}.png', 'z': z, 'ox': tx0 * 256, 'oy': ty0 * 256, 'w': im.width, 'h': im.height}
R = json.load(open('rotas.json')); M = {}
for k in ('iguatu', 'atacarejo', 'saopedro', 'pompeu'):
    r = R[k]; pts = r['geom'] + [r['destino']]
    if k == 'iguatu': pts.append(R['fabrica']['destino'])
    M[k] = stitch(f'rua_{k}', pts, 16, 300, 420)
for k, c in (('cidade_iguatu', (-6.3575, -39.3), ), ('cidade_juazeiro', (-7.213, -39.33)), ('cidade_pompeu', (-5.5875, -39.373))):
    M[k] = stitch(k, [c], 13, 0, 0)
json.dump(M, open('mapas.json', 'w'), indent=1)
