// Check what routes are actually registered
const express = require('express');
const adminRoutes = require('./routers/admin-routes');

const app = express();

// Add the admin routes
app.use('/api/admin', adminRoutes);

// Get all registered routes
function getRoutes() {
  const routes = [];
  
  function extractRoutes(layer) {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods);
      const path = layer.route.path;
      methods.forEach(method => {
        routes.push({
          method: method.toUpperCase(),
          path: path,
          fullPath: `/api/admin${path}`
        });
      });
    } else if (layer.name === 'router') {
      layer.handle.stack.forEach(extractRoutes);
    }
  }
  
  app._router.stack.forEach(extractRoutes);
  return routes;
}

console.log('🔍 Checking registered routes...\n');

const routes = getRoutes();
console.log('Registered admin routes:');
routes.forEach(route => {
  console.log(`  ${route.method} ${route.fullPath}`);
});

console.log('\n🎯 Route Check Complete');
