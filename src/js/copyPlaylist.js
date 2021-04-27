const copyBtn = document.getElementById('copy-button')
const copyTxt = document.getElementById('copy-text')
const playlistTxt = document.getElementById('playlist-name-text')
const playlistCode = document.querySelector('.playlist-name')


if(playlistCode && playlistTxt) {
  const createCopyElement = (button, textEl, type) => {
    button.addEventListener('click', () => {
      console.log('clicked')
      let resetText = button.innerHTML
      textEl.focus()
      textEl.select()
      textEl.setSelectionRange(0, 99999)

      try {
        const successful = document.execCommand('copy')
        const msg = successful ? 'successful' : 'unsuccessful'
        console.log('Copying text command was ' + msg)
        button.innerHTML = "Copied " + type
        setTimeout(() => {
          button.innerHTML = resetText
        }, 3000)
      } catch (err) {
        console.log('Oops, unable to copy', err)
        button.innerHTML = "Please retry"
      }
    })
  }

  if(copyBtn && copyTxt) {
    createCopyElement(copyBtn, copyTxt, 'URL')
  }
  createCopyElement(playlistCode, playlistTxt, 'Code')
}


