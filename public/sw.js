const CACHE_NAME = 'combinify-cache-v6'
const CACHE_URLS = [
  '/css/index.css',
  '/js/bundle.min.js',
  '/',
  '/offline'
]
const DENY_URL = ['/home', '/login', '/']

// Install the service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then((cache) =>{
      console.log('Opened cache')
      return cache.addAll(CACHE_URLS)
    }).then(() => self.skipWaiting()).catch(err=> console.log(err))
  )
});

// Activate the service worker
self.addEventListener('activate', event => {

  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();

  event.waitUntil(
    // Check for old caches, delete if old.
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .map(cacheName => {
            if(cacheName !== CACHE_NAME) return caches.delete(cacheName)
          })
      );
    })
  )
});

// Make the service worker fetch pages
self.addEventListener('fetch', event => {

  if(event.request.method !== 'GET') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/offline')))
    return
  }

  // Cache each page upon visiting
  event.respondWith(
    caches.match(event.request)
    .then((response) => {

      // Cache hit - return response
      if (response) {
        return response
      }

      return fetch(event.request).then(
        response => {
          // Check if we received a valid response
          if (!response) {
            return caches.match('/offline')
          }

          // Clone the response
          const responseToCache = response.clone()

          // Cache the page
          if(!event.request.url.includes('/playlists/')) {
            caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache).then((res) => {
                console.log(res)
              }).catch(err => console.log(err));
            })
          }

          return response
        }
      ).catch(() => caches.match('/offline'))
    })
  );

});

// Re-cache the playlists
self.addEventListener('sync', async event => {

  // If tag doesnt match, return
  if (event.tag !== 'sync-playlists') return

  // Else Sync the playlist pages!
  const cache = await caches.open('playlist-cache')
  const keys = await cache.keys()
  const responses = await Promise.all(keys.map(key => fetch(key)))

  responses.forEach((res, index )=> {
    cache.put(keys[index], res)
  })
})
