const offlinePlaylists = document.querySelector('.offline-playlists')

if(offlinePlaylists) {
  caches.open('playlist-cache').then(cache => {
    return cache.keys()
  }).then(keys => {
    return keys.map(key => {
      return key.url
    })
  }).then(urls => {
    urls.forEach(url => {
      offlinePlaylists.innerHTML += `<li><a href="${url}">${url}</a></li>`
    })
  })
}
