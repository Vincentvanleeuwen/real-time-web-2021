const divInstall = document.getElementById('installContainer')
const butInstall = document.getElementById('butInstall')

butInstall.addEventListener('click', async () => {
  console.log('👍', 'butInstall-clicked')
  const promptEvent = window.deferredPrompt
  if (!promptEvent) {
    // The deferred prompt isn't available.
    return
  }
  // Show the install prompt.
  promptEvent.prompt()
  // Log the result
  const result = await promptEvent.userChoice
  console.log('👍', 'userChoice', result)

  // Reset the deferred prompt variable, since prompt() can only be called once.
  window.deferredPrompt = null
  // Hide the install button.
  divInstall.classList.toggle('hidden', true);
});

// If service worker is supported
if ('serviceWorker' in navigator) {

  // Make sure page is loaded
  window.addEventListener('load', () => {

    // Register the service worker
    navigator.serviceWorker
    .register('../sw.js')
    .then(reg => {

      if(reg.installing) {
        console.log('Service worker installing')
      } else if(reg.waiting) {
        console.log('Service worker installed')
      } else if(reg.active) {
        console.log('Service worker active')
      }

    }).catch(error => console.log('Registration failed with ' + error));
  })
}
