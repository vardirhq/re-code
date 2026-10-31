import { defineConfig } from 'vite';
export default defineConfig({base: process.env.GITHUB_ACTIONS ? '/re-code/' : './', build: {target:'es2022'}});
