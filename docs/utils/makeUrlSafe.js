const makeUrlSafe = (name) => {
  return name.replace(/\s+/g, '-').toLowerCase()
}

module.exports = {
  makeUrlSafe
}
