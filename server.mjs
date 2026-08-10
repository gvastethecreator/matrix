import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGlyphsHandler } from './api/generateGlyphs.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const port = Number.parseInt(process.env.PORT || '4173', 10);
const host = process.env.HOST || '127.0.0.1';
const glyphsHandler = createGlyphsHandler();
const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

if (!existsSync(path.join(root, 'index.html'))) {
  throw new Error('No existe dist/index.html. Ejecuta `pnpm build` antes de iniciar.');
}

createServer((request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  if (url.pathname === '/api/glyphs') {
    void glyphsHandler(request, response);
    return;
  }

  const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  let filePath = path.resolve(root, relativePath || 'index.html');
  if (!filePath.startsWith(`${root}${path.sep}`) || !existsSync(filePath)) {
    filePath = path.join(root, 'index.html');
  }

  response.writeHead(200, {
    'content-type': mimeTypes.get(path.extname(filePath)) || 'application/octet-stream',
    'x-content-type-options': 'nosniff',
  });
  createReadStream(filePath).pipe(response);
}).listen(port, host, () => {
  console.log(`Matrix disponible en http://${host}:${port}`);
});
