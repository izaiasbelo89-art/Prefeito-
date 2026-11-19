"""Calcula as rotas reais de carro (OSRM / OpenStreetMap) até cada unidade. Gera rotas.json."""
import json, subprocess, time
UA = 'video-map-builder/1.0'
PONTOS = {
 'iguatu':   {'nome': 'Corbã Iguatu', 'origem': ('Rodoviária de Iguatu', -6.363066, -39.302103), 'destino': (-6.3614306, -39.2959674), 'conf': 'guia comercial'},
 'fabrica':  {'nome': 'Fábrica Corbã', 'origem': None, 'destino': (-6.3530194, -39.3097325), 'conf': 'guia comercial'},
 'atacarejo':{'nome': 'Corbã Atacarejo', 'origem': ('Basílica de N. Sra. das Dores', -7.199203, -39.316954), 'destino': (-7.227425, -39.347659), 'conf': 'aproximado: trecho da Av. Padre Cícero no São José'},
 'saopedro': {'nome': 'Corbã Salesianos', 'origem': ('Basílica de N. Sra. das Dores', -7.199203, -39.316954), 'destino': (-7.217322, -39.31856), 'conf': 'aproximado: Rua São Pedro (trecho indicado pelo OpenStreetMap)'},
 'pompeu':   {'nome': 'Corbã Senador Pompeu', 'origem': ('Centro de Senador Pompeu', -5.587439, -39.37309), 'destino': (-5.5907, -39.3745), 'conf': 'aproximado: Av. Francisco França Cambraia'},
}
out = {}
for k, p in PONTOS.items():
    r = {'nome': p['nome'], 'destino': p['destino'], 'conf': p['conf']}
    if p['origem']:
        o = p['origem']; d = p['destino']
        url = f"https://router.project-osrm.org/route/v1/driving/{o[2]},{o[1]};{d[1]},{d[0]}?overview=full&geometries=geojson"
        j = json.loads(subprocess.run(['curl', '-s', '-m', '30', '-A', UA, url], capture_output=True, text=True).stdout)
        rt = j['routes'][0]
        r.update({'origem': o, 'geom': [[round(lat, 6), round(lon, 6)] for lon, lat in rt['geometry']['coordinates']], 'dist_m': round(rt['distance']), 'dur_s': round(rt['duration'])})
        print(f"{k}: {rt['distance']:.0f} m, {len(rt['geometry']['coordinates'])} pontos, de {o[0]}")
        time.sleep(1.5)
    out[k] = r
json.dump(out, open('rotas.json', 'w'), ensure_ascii=False, indent=1)
