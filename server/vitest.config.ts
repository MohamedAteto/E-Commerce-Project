import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    testTimeout: 20000,
    pool: 'threads',
    fileParallelism: false, // Run test files serially to prevent database race conditions
  },
});
