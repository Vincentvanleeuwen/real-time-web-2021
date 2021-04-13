const makeUrlSafe = (name) => {
  console.log(name)
  return name.replace(/\s+/g, '-').toLowerCase()
}

module.exports = {
  makeUrlSafe
}
