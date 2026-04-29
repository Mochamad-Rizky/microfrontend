import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import packageJson from './package.json';
import { federation } from '@module-federation/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'repo1',
      filename: 'remoteEntry.js',
      exposes: {
        './BoxButton': './src/components/BoxButton.tsx',
        './useCountStore': './src/store/useCountStore.ts',
      },
      dts: {
        tsConfigPath: './tsconfig.app.json',
        generateTypes: true,
        consumeTypes: false,
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: packageJson.dependencies.react,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: packageJson.dependencies['react-dom'],
        },
      },
    }),
  ],
  server: {
    port: 5173,
  },
});