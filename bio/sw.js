const CACHE_NAME = 'bio-app-v1';
const urlsToCache = [
  '/',
  '/src/styles/main.css',
  '/assets/js/main.js',
  '/src/components/bio.component.js',
  '/src/services/supabase.service.js'
];

// Install
self.addEventListener('install', (event) => {
  console.log('📱 Service Worker instalado');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.warn('⚠️ Erro ao cachear arquivos:', error);
      })
  );
});

// Activate
self.addEventListener('activate', (event) => {
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch (cache-first strategy for static assets)
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip Supabase requests
  if (event.request.url.includes('supabase.co')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .catch((error) => {
            console.warn('📡 Fetch failed:', error);
            // Return a basic offline page if available
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync (future enhancement)
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
});

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
});