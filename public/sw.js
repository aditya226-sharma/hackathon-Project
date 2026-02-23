const CACHE = 'runanywhere-v1';
const OFFLINE_ASSETS = [
  '/',
  '/index.html',
  '/sw.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => 
      cache.addAll(OFFLINE_ASSETS).catch(() => {})
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  const { url, method } = e.request;
  
  if (method !== 'GET') return;
  
  // Cache AI models, assets, and app files
  if (url.includes('/assets/') || url.endsWith('.wasm') || url.endsWith('.gguf') || 
      url.endsWith('.onnx') || url.endsWith('.tar.gz') || url.includes('huggingface.co')) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(res => {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
          }).catch(() => cached || new Response('Offline', { status: 503 }));
        })
      )
    );
  }
  // Network first for API calls, fallback to cache
  else if (url.includes('supabase.co')) {
    e.respondWith(
      fetch(e.request)
        .catch(() => caches.match(e.request))
        .then(res => res || new Response('Offline', { status: 503 }))
    );
  }
  // Cache first for app files
  else {
    e.respondWith(
      caches.match(e.request).then(cached => 
        cached || fetch(e.request).then(res => {
          if (res.ok) {
            caches.open(CACHE).then(cache => cache.put(e.request, res.clone()));
          }
          return res;
        }).catch(() => new Response('Offline', { status: 503 }))
      )
    );
  }
});
