const copyBtn = document.getElementById('copy-button')
const copyTxt = document.getElementById('copy-text')

if(copyBtn && copyTxt) {
  copyBtn.addEventListener('click', () => {

    // Select the url
    copyTxt.focus()
    copyTxt.select()

    try {
      const successful = document.execCommand('copy')
      const msg = successful ? 'successful' : 'unsuccessful'
      console.log('Copying text command was ' + msg)
      copyBtn.innerHTML = "Copied URL"
    } catch (err) {
      console.log('Oops, unable to copy')
      copyBtn.innerHTML = "Please retry"
    }
  })
}
