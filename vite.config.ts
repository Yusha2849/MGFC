import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import { generateClubAiResponse } from './server/aiService';

function apiServerPlugin(): Plugin {
  return {
    name: 'mgfc-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        res.setHeader('Content-Type', 'application/json');

        if (url.pathname === '/api/status') {
          res.statusCode = 200;
          res.end(JSON.stringify({
            status: 'online',
            geminiConfigured: !!process.env.GEMINI_API_KEY,
            club: 'Marlboro Gardens Football Club (MGFC)',
            location: 'Marlboro Gardens, Sandton, Gauteng',
          }));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = body ? JSON.parse(body) : {};

              if (url.pathname === '/api/ai/generate') {
                const type = payload.type || 'general';
                const result = await generateClubAiResponse(type, payload.data || payload);
                res.statusCode = result.success ? 200 : 500;
                res.end(JSON.stringify(result));
                return;
              }

              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Endpoint not found' }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err?.message || 'Invalid JSON payload' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
