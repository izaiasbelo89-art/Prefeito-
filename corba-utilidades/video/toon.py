"""Transforma vídeos reais em visual de animação (cartoon), preservando os lugares.
uso: python3 toon.py entrada.mov saida.mp4 [inicio] [duracao] [estilo]   estilo: toon | aquarela"""
import cv2, numpy as np, sys, subprocess
src, dst = sys.argv[1], sys.argv[2]
ss = float(sys.argv[3]) if len(sys.argv) > 3 else 0; dur = float(sys.argv[4]) if len(sys.argv) > 4 else 999
style = sys.argv[5] if len(sys.argv) > 5 else 'toon'
W, H = 1080, 1920
cap = cv2.VideoCapture(src); fps = cap.get(cv2.CAP_PROP_FPS) or 30
cap.set(cv2.CAP_PROP_POS_MSEC, ss * 1000)
step = max(1, round(fps / 30))  # gera 30 fps
ff = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '30', '-i', '-',
                       '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', dst], stdin=subprocess.PIPE)
palette = None; n = 0; prev = None
def quant(img, pal):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
    d = ((lab[:, None, :] - pal[None, :, :]) ** 2).sum(-1); idx = d.argmin(1)
    return cv2.cvtColor(pal[idx].reshape(img.shape).astype(np.uint8), cv2.COLOR_LAB2BGR)
while True:
    ok, fr = cap.read()
    if not ok or n / fps > dur: break
    n += 1
    if (n - 1) % step: continue
    h, w = fr.shape[:2]; s = max(W / w, H / h)
    fr = cv2.resize(fr, (round(w * s), round(h * s)), interpolation=cv2.INTER_LANCZOS4)
    y0 = (fr.shape[0] - H) // 2; x0 = (fr.shape[1] - W) // 2; fr = fr[y0:y0 + H, x0:x0 + W]
    if style == 'aquarela':
        out = cv2.stylization(fr, sigma_s=60, sigma_r=0.45)
    else:
        small = cv2.resize(fr, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
        sm = small
        for _ in range(4): sm = cv2.bilateralFilter(sm, 9, 40, 9)
        hsv = cv2.cvtColor(sm, cv2.COLOR_BGR2HSV).astype(np.float32); hsv[..., 1] = np.clip(hsv[..., 1] * 1.35, 0, 255); hsv[..., 2] = np.clip(hsv[..., 2] * 1.05 + 8, 0, 255)
        sm = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
        if palette is None:
            lab = cv2.cvtColor(sm, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32)
            _, _, centers = cv2.kmeans(lab[::7], 18, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 1), 3, cv2.KMEANS_PP_CENTERS)
            palette = centers
        q = quant(sm, palette)
        q = cv2.medianBlur(q, 5)
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY); gray = cv2.medianBlur(gray, 7)
        edges = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 4)
        edges = cv2.erode(edges, np.ones((2, 2), np.uint8))
        out = cv2.bitwise_and(q, q, mask=edges)
        out = cv2.resize(out, (W, H), interpolation=cv2.INTER_CUBIC)
        out = cv2.GaussianBlur(out, (3, 3), 0)
    if prev is not None: out = cv2.addWeighted(out, .7, prev, .3, 0)  # reduz cintilação
    prev = out
    ff.stdin.write(out.tobytes())
ff.stdin.close(); ff.wait(); print('ok', dst)
