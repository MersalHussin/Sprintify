import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const vercelConfigPath = path.join(rootDir, 'vercel.json');

const backendUrl = process.env.BACKEND_URL?.trim().replace(/\/+$/, '');
const viteApiUrl = process.env.VITE_API_URL?.trim();

const rewrites = [];

if (backendUrl) {
  rewrites.push({
    source: '/api/:path*',
    destination: `${backendUrl}/api/:path*`,
  });
}

rewrites.push({ source: '/(.*)', destination: '/index.html' });

writeFileSync(vercelConfigPath, `${JSON.stringify({ rewrites }, null, 2)}\n`);

if (process.env.VERCEL) {
  if (backendUrl) {
    console.log(`[vercel] API proxy: /api/* -> ${backendUrl}/api/*`);
  } else if (viteApiUrl?.startsWith('http')) {
    console.log(`[vercel] Direct API calls via VITE_API_URL (${viteApiUrl})`);
  } else if (viteApiUrl === '/api' || !viteApiUrl) {
    console.warn(
      '[vercel] Set BACKEND_URL (recommended) or VITE_API_URL to your deployed API before building.',
    );
  }
}
