import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    base: './',
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.png'],
            manifest: {
                name: 'Evalingua Game',
                short_name: 'Evalingua',
                description: 'Evalingua Game is a game to evaluate your pronunciation.',
                theme_color: '#000000',
                background_color: '#000000',
                orientation: 'landscape',
                display: 'standalone',
                icons: [
                    {
                        src: 'logo-evalingua-144x144.png',
                        sizes: '144x144',
                        type: 'image/png'
                    },
                    {
                        src: 'logo-evalingua-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'logo-evalingua-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'logo-evalingua-maskable-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ],
                screenshots: [
                    {
                        src: 'screenshoot-mobile.png',
                        sizes: '844x390',
                        type: 'image/png',
                        label: 'Evalingua Game'
                    },
                    {
                        src: 'screenshoot-tablet.png',
                        sizes: '1024x768',
                        type: 'image/png',
                        label: 'Evalingua Game'
                    }
                ],
                start_url: './',
                id: '/',
                prefer_related_applications: false,
            },
            workbox: {
                globPatterns: ['**/*.{js,ts,css,html,ico,png,svg,jpg,mp3,ogg,wav}'],
                runtimeCaching: [
                    {
                        urlPattern: /\.(png|jpg|jpeg|svg|gif|json|mp3|wav|ogg)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'game-assets',
                            expiration: {
                            maxEntries: 200,
                            maxAgeSeconds: 14 * 24 * 60 * 60 // 14 días
                            }
                        }
                    },
                        // JavaScript y CSS
                    {
                        urlPattern: /\.(js|css)$/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'static-resources',
                            expiration: {
                            maxEntries: 50,
                            maxAgeSeconds: 7 * 24 * 60 * 60 // 7 días
                            }
                        }
                    },
                ]
            },
            devOptions: {
                enabled: true,
                type: 'module'
            }
        })
    ],
    logLevel: 'warning',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                passes: 2
            },
            mangle: true,
            format: {
                comments: false
            }
        }
    }
});
