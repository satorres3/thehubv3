import { defineConfig, loadEnv } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');

  // Create an object with only the keys we want to expose
  const exposedEnvs = {};

  return {
    define: {
      // Expose a sanitized version of `process.env` to your client-side code.
      // `JSON.stringify` is crucial here.
      'process.env': JSON.stringify(exposedEnvs)
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:7071',
          changeOrigin: true,
        },
      },
    },
    plugins: [
      viteStaticCopy({
        targets: [
          { src: 'src/pages', dest: 'src' },
          { src: 'src/modals', dest: 'src' }
        ]
      })
    ],
    build: {
      target: 'esnext' // Ensure modern JS syntax is supported
    }
  }
});