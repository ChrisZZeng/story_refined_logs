import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { createWorkbenchApiHandler } from './api.mjs';

const STATIC_ROOT = new URL('./static/', import.meta.url).pathname;

export async function startWorkbenchServer({
  taskPath,
  promptSourcesConfigPath,
  host = '127.0.0.1',
  port = 0,
  cwd = process.cwd(),
  loadPromptSources,
  runPromptPatchReplay,
} = {}) {
  const apiHandler = createWorkbenchApiHandler({
    taskPath,
    promptSourcesConfigPath,
    cwd,
    loadPromptSources,
    runPromptPatchReplay,
  });

  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', `http://${host}`);
      if (url.pathname.startsWith('/api/')) {
        const apiResponse = await apiHandler({
          method: request.method,
          url: request.url,
          headers: request.headers,
          body: await readJsonBody(request),
        });
        response.writeHead(apiResponse.status, apiResponse.headers);
        response.end(apiResponse.body);
        return;
      }

      const staticResponse = await readStaticAsset(url.pathname);
      response.writeHead(200, staticResponse.headers);
      response.end(staticResponse.body);
    } catch (error) {
      response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
      response.end(`${JSON.stringify({ error: error instanceof Error ? error.message : String(error) })}\n`);
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });

  const address = server.address();
  const actualPort = typeof address === 'object' && address ? address.port : port;
  return {
    url: `http://${host}:${actualPort}`,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  };
}

async function readJsonBody(request) {
  if (request.method !== 'POST' && request.method !== 'PUT') return undefined;
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  if (text.trim().length === 0) return {};
  return JSON.parse(text);
}

async function readStaticAsset(urlPathname) {
  const assetName = urlPathname === '/' ? 'index.html' : urlPathname.slice(1);
  const assetPath = path.resolve(STATIC_ROOT, assetName);
  if (!assetPath.startsWith(path.resolve(STATIC_ROOT))) {
    throw new Error('Invalid static asset path');
  }
  return {
    body: await readFile(assetPath),
    headers: { 'content-type': contentType(assetPath) },
  };
}

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  return 'application/octet-stream';
}
