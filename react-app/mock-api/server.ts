import { createServer } from 'node:http';
import { handle } from './handlers.ts';

const PORT = Number(process.env.PORT ?? 8000);
const ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
const DELAY_MS = Number(process.env.MOCK_DELAY_MS ?? 0);

createServer((req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': ORIGIN,
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin'
  };
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors).end();
    return;
  }
  const chunks: Buffer[] = [];
  req.on('data', (c: Buffer) => chunks.push(c));
  req.on('end', () => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let body: unknown = null;
    const raw = Buffer.concat(chunks).toString();
    if (raw !== '') {
      try {
        body = JSON.parse(raw);
      } catch {
        body = null;
      }
    }
    const result = handle({
      method: req.method ?? 'GET',
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      headers: { authorization: req.headers.authorization },
      body
    });
    console.log(`${req.method} ${url.pathname}${url.search} -> ${result.status}`);
    setTimeout(() => {
      res.writeHead(result.status, { ...cors, 'Content-Type': 'application/json' }).end(JSON.stringify(result.body));
    }, DELAY_MS);
  });
}).listen(PORT, () => console.log(`Mock Analytics API on http://localhost:${PORT} (CORS: ${ORIGIN})`));
