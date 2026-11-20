import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// Local preview only. The course builds app/ itself, with its own settings.
export default defineConfig({plugins: [react()]});
