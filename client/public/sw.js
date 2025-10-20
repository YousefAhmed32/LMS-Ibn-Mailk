// Service Worker for LMS Performance Optimization
const CACHE_NAME = 'lms-cache-v1';
const STATIC_CACHE = 'lms-static-v1';
const DYNAMIC_CACHE = 'lms-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/images/placeholder.jpg'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Handle different types of requests
  if (isStaticAsset(request)) {
    // Static assets - cache first
    event.respondWith(cacheFirst(request));
  } else if (isApiRequest(request)) {
    // API requests - network first with cache fallback
    event.respondWith(networkFirst(request));
  } else {
    // HTML pages - network first
    event.respondWith(networkFirst(request));
  }
});

// Check if request is for static assets
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith('/static/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/uploads/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf')
  );
}

// Check if request is for API
function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// Cache first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('🎯 Cache hit for static asset:', request.url);
      return cachedResponse;
    }
    
    console.log('❌ Cache miss for static asset:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('💾 Cached static asset:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache first strategy failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    console.log('🌐 Network first for:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('💾 Cached dynamic content:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('❌ Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('🎯 Cache hit for dynamic content:', request.url);
      return cachedResponse;
    }
    
    console.error('❌ Both network and cache failed:', error);
    return new Response('Offline content not available', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions when connection is restored
  console.log('🔄 Performing background sync...');
  // Implementation for syncing offline data
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from LMS',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/images/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('LMS Notification', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('✅ Service Worker loaded successfully');