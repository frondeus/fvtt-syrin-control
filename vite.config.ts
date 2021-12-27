import type { UserConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import checker from "vite-plugin-checker";

const path = require('path');

const config: UserConfig = {
    root: 'src/',
    publicDir: path.resolve(__dirname, 'public'),
    base: '/modules/fvtt-syrin-control/',
    server: {
        port: 9443,
        open: true,
        proxy: {
            '/cors': {
                target: 'https://localhost:8443',
                secure: false
            },
            '^(?!\/modules\/fvtt-syrin-control)': 'http://localhost:3000/',
            '/socket.io': {
                target: 'ws://localhost:3000',
                ws: true
            },
        }
    },
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true,
        sourcemap: true,
        lib: {
            name: 'main',
            entry: path.resolve(__dirname, 'src/main.ts'),
            formats: ['es'],
            fileName: (_format) => 'index.js'
        }
    },
    plugins: [
        svelte({
            configFile: '../svelte.config.cjs'
        }),
        checker({
            typescript: true
        })
    ]
}

export default config;
