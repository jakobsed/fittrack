const CACHE_NAME = 'fitapp-v8';
const ASSETS_TO_CACHE = [
    '/fittrack/',
    '/fittrack/index.html',
    '/fittrack/css/variables.css',
    '/fittrack/css/base.css',
    '/fittrack/css/components.css',
    '/fittrack/css/screens.css',
    '/fittrack/js/app.js',
    '/fittrack/js/data.js',
    '/fittrack/js/storage.js',
    '/fittrack/js/components/timer.js',
    '/fittrack/js/components/modal.js',
    '/fittrack/js/components/charts.js',
    '/fittrack/js/screens/home.js',
    '/fittrack/js/screens/workout.js',
    '/fittrack/js/screens/templates.js',
    '/fittrack/js/screens/exercises.js',
    '/fittrack/js/screens/stats.js',
    '/fittrack/js/screens/settings.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((error) => {
                console.log('Error caching assets:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .then((fetchResponse) => {
                        // Don't cache external resources
                        if (!event.request.url.startsWith(self.location.origin)) {
                            return fetchResponse;
                        }
                        // Cache new resources
                        return caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, fetchResponse.clone());
                                return fetchResponse;
                            });
                    });
            })
            .catch(() => {
                // Offline fallback
                return caches.match('/index.html');
            })
    );
});
