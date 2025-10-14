// Script to clear service worker caches
// Run this in the browser console if you're still experiencing cache issues

if ('serviceWorker' in navigator) {
  // Unregister all service workers
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log('Unregistered service worker:', registration);
    });
  });

  // Clear all caches
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
        console.log('Deleted cache:', cacheName);
      });
    });
  }
}

console.log('Service worker cache clearing completed. Please refresh the page.');
