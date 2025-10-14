// Service worker for development environment
const CACHE_NAME = 'lms-dev-cache-v1';

// Install event - minimal setup for development
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

// Fetch event - network first strategy for development
self.addEventListener('fetch', (event) => {
  // Skip service worker for development server requests
  if (event.request.url.includes('localhost') || 
      event.request.url.includes('127.0.0.1') ||
      event.request.url.includes(':5173')) {
    return; // Let the browser handle these requests normally
  }

  // For other requests, try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If successful, cache the response
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // If no cache match and it's a navigation request, return offline page
            if (event.request.mode === 'navigate') {
              return new Response('Offline - Please check your connection', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            }
            throw new Error('No cache match');
          });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
