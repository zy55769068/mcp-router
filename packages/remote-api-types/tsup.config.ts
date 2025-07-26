import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'schema/index': 'src/schema/index.ts'
  },
  format: ['cjs', 'esm'],
  dts: {
    resolve: false,
    entry: {
      index: 'src/index.ts',
      'schema/index': 'src/schema/index.ts'
    }
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['@mcp_router/shared'],
});