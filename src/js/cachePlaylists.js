// if ('serviceWorker' in navigator) {
//   cachePlaylist()
// }
//
// async function cachePlaylist() {
//   const pathname = window.location.pathname
//
//   if (!pathname.includes('/playlists/')) {
//     return
//   }
//
//   const cache = await caches.open('playlist-cache')
//
//   if(navigator.onLine) {
//     const res = await fetch(pathname)
//     await cache.put(pathname, res)
//   } else {
//     // Check if its online again!
//     window.addEventListener('onLine', async () => {
//       // Backgroundsync (refresh)
//       const registration = await navigator.serviceWorker.getRegistration()
//       await registration.sync.register('sync-playlists')
//     })
//   }
// }
//
