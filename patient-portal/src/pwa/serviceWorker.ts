// Service Worker for Offline PWA Support (Ajay assist)
const CACHE_NAME = 'smartcare-v1';
self.addEventListener('install', (e: any) => { (self as any).skipWaiting(); });
