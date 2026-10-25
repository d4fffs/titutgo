import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const outDir1 = path.join(rootDir, 'sititut-mascots');
const outDir2 = path.join(rootDir, 'public', 'sititut-mascots');
const zipFile1 = path.join(rootDir, 'sititut-mascots.zip');
const zipFile2 = path.join(rootDir, 'public', 'sititut-mascots.zip');

if (!fs.existsSync(outDir1)) fs.mkdirSync(outDir1, { recursive: true });
if (!fs.existsSync(outDir2)) fs.mkdirSync(outDir2, { recursive: true });

const savedFiles = [];

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { filename, base64 } = JSON.parse(body);
        const data = base64.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(data, 'base64');

        const filePath1 = path.join(outDir1, filename);
        const filePath2 = path.join(outDir2, filename);
        fs.writeFileSync(filePath1, buffer);
        fs.writeFileSync(filePath2, buffer);

        savedFiles.push(filename);
        console.log(`[ExportServer] Saved: ${filename} (${buffer.length} bytes)`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, filename, size: buffer.length }));
      } catch (err) {
        console.error('[ExportServer] Save error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/finish') {
    try {
      console.log(`[ExportServer] All ${savedFiles.length} files saved. Packaging into zip...`);
      // Use powershell Compress-Archive
      const psCmd = `Compress-Archive -Path "${outDir1}\\*.png" -DestinationPath "${zipFile1}" -Force`;
      execSync(`powershell.exe -NoProfile -Command "${psCmd}"`, { stdio: 'inherit' });
      fs.copyFileSync(zipFile1, zipFile2);

      const zipSize = fs.statSync(zipFile1).size;
      console.log(`[ExportServer] ZIP created successfully: ${zipFile1} (${zipSize} bytes)`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: savedFiles.length, zipFile1, zipFile2, zipSize }));
    } catch (err) {
      console.error('[ExportServer] ZIP error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

const PORT = 3888;
server.listen(PORT, () => {
  console.log(`[ExportServer] Mascot Exporter Server listening on http://localhost:${PORT}`);
});
