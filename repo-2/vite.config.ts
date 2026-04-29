import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'repo2',
      filename: 'remoteEntry.js',
      remotes: {
        'repo1': {
          name: 'repo1',
          entry: 'http://localhost:5173/remoteEntry.js',
          type: 'module',
        },
      },
      dts: {
        generateTypes: false,
        consumeTypes: {
          family: 6
        },
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
    port: 5174,
  },
});