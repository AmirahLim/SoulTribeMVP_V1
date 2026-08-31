import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/__tests__/**/*.test.ts'],
    alias: {
      '@soul-tribe/core': path.resolve(__dirname, '../../packages/core/index.ts'),
    },
  },
});
