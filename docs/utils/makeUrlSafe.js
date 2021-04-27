/**
 * Changes a string from "String like this" to "string-like-this"
 * @name  {string} the playlist name + hashtag code
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
