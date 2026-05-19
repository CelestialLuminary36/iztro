import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: 'dist',
    target: 'es2022',
    platform: 'neutral',
    external: ['dayjs', 'i18next', 'lunar-lite', 'lunar-typescript'],
  },
  {
    entry: { 'iztro.min': 'src/index.ts' },
    format: ['iife'],
    globalName: 'iztro',
    minify: true,
    sourcemap: true,
    outDir: 'dist/umd',
    target: 'es2018',
    platform: 'browser',
    noExternal: ['dayjs', 'i18next', 'lunar-lite', 'lunar-typescript'],
  },
  {
    entry: { 'server/index': 'src/server/index.ts' },
    format: ['cjs'],
    dts: true,
    sourcemap: true,
    outDir: 'dist',
    target: 'node18',
    platform: 'node',
    external: ['@grpc/grpc-js'],
    banner: { js: '#!/usr/bin/env node' },
  },
]);
