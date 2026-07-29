import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig(async () => {
  const dirname = path.dirname(new URL(import.meta.url).pathname);

  const portVal = process.env.PORT ?? '5173';
  const port = Number(portVal);
  const basePath = process.env.BASE_PATH ?? '/';

  const plugins: any[] = [react(), tailwindcss()];

  // Optional Replit runtime overlay plugin
  try {
    const runtime = await import('@replit/vite-plugin-runtime-error-modal');
    if (runtime?.default) plugins.push(runtime.default());
  } catch (e) {
    // ignore if not available
  }

  // Optional Replit dev-only plugins
  if (process.env.REPL_ID) {
    try {
      const carto = await import('@replit/vite-plugin-cartographer');
      const devBanner = await import('@replit/vite-plugin-dev-banner');
      if (carto?.cartographer) plugins.push(carto.cartographer({ root: path.resolve(dirname, '..') }));
      if (devBanner?.devBanner) plugins.push(devBanner.devBanner());
    } catch (e) {
      // ignore if not available
    }
  }

  return {
    base: basePath,
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(dirname, 'src'),
        '@assets': path.resolve(dirname, '..', 'attached_assets'),
      },
      dedupe: ['react', 'react-dom'],
    },
    root: path.resolve(dirname),
    build: {
      outDir: path.resolve(dirname, 'dist/public'),
      emptyOutDir: true,
    },
    server: {
      port: Number.isNaN(port) ? 5173 : port,
      strictPort: false,
      host: '0.0.0.0',
      allowedHosts: true,
      fs: { strict: true },
    },
    preview: {
      port: Number.isNaN(port) ? 5173 : port,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});
