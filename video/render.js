// Renderiza a animação quadro a quadro (Playwright/Chromium) e gera o MP4 com ffmpeg.
// Uso: node render.js            -> vídeo completo (out/video_noaudio.mp4)
//      node render.js --stills 1.0,3.5,...  -> PNGs em out/stills/
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), fs = require('fs'), http = require('http');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.wav': 'audio/wav' };
function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, r) => {
      const f = path.join(__dirname, decodeURIComponent(req.url.split('?')[0]));
      if (!f.startsWith(__dirname) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}

(async () => {
  const args = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  const pg = process.env.PAGE || 'index.html'; const srv = await serve(); await page.goto(`http://127.0.0.1:${srv.address().port}/${pg}?render=1`);
  await page.evaluate(() => window.ready);
  const grab = t => page.evaluate(t => { window.renderFrame(t); return document.getElementById('c').toDataURL('image/png'); }, t);

  if (args[0] === '--stills') {
    fs.mkdirSync(path.join(__dirname, 'out/stills'), { recursive: true });
    for (const s of args[1].split(',')) {
      const d = await grab(parseFloat(s));
      fs.writeFileSync(path.join(__dirname, 'out/stills', `t${parseFloat(s).toFixed(2).padStart(6, '0')}.png`), Buffer.from(d.split(',')[1], 'base64'));
    }
    await browser.close(); srv.close(); return;
  }
  const fps = await page.evaluate(() => window.FPS), dur = await page.evaluate(() => window.DUR);
  const n = Math.round(fps * dur);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(fps), path.join(__dirname, 'out', process.env.OUT || 'video_noaudio.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const d = await grab(i / fps);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) process.stdout.write(`frame ${i}/${n} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  await browser.close(); srv.close();
  console.log('ok', n, 'frames');
})();
