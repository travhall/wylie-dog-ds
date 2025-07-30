import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  if (mode === 'ui') {
    // Build UI as single file
    return {
      plugins: [
        react({ jsxImportSource: 'preact' }),
        viteSingleFile({
          useRecommendedBuildConfig: true,
        })
      ],
      build: {
        target: 'es2020',
        outDir: 'dist',
        emptyOutDir: false, // Don't clear dist directory
        rollupOptions: {
          input: 'src/ui/index.html',
        },
        minify: false,
        sourcemap: false
      },
      resolve: {
        alias: {
          'react': 'preact/compat',
          'react-dom': 'preact/compat'
        }
      }
    };
  }

  // Build plugin
  return {
    plugins: [],
    build: {
      target: 'es2020',
      outDir: 'dist',
      rollupOptions: {
        input: 'src/plugin/main.ts',
        output: {
          entryFileNames: 'plugin.js',
          format: 'iife'
        }
      },
      minify: false,
      sourcemap: false
    }
  };
});
