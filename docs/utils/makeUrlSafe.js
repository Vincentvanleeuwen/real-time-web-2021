/**
 * Changes a string from "String like this" to "string-like-this"
 * @param  {name} the string
 * @return {string} the changed string
 */

const makeUrlSafe = (name) => {
  return name.replace(/\s+/g, '-')
}

const makeUrlUnsafe = (name) => {
  return name.replace(/-+/g, ' ')
}

module.exports = {
  makeUrlSafe,
  makeUrlUnsafe
}
