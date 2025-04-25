/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'


export const certPath = path.resolve(__dirname, '../certificates/localhost+2.pem')
export const keyPath = path.resolve(__dirname, '../certificates/localhost+2-key.pem')

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react()
    ],
    server: {
        https: {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
        },
        port: 8082,
        host: 'localhost',
    }
})
