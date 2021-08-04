const dataAttributes = [
  'display_name',
  'id',
  'images',
  'items'
]

/**
 * Delete unnecessary columns
 * @data  {object} Spotify user data
 * @return {object} Filtered data
 */
const deleteColumns = (data) => {

  return Object.entries(data).map(entry => {

    if(!dataAttributes.includes(entry[0])) {
      delete entry[0]
      delete entry[1]
    } else {
      return entry
    }

  })
  .filter(entry => entry !== undefined)
}

/**
 * Change spotify data structure.
 * @data  {object} Spotify user data
 * @return {object} Restructured data
 */
const restructureData = (data) => {

  let spotifyId = data[1][1],
    displayName = data[0][1];

  // If a user has no image, set placeholder image
  let spotifyImg = data[2][1].length === 0 ? '/img/placeholder.png' : data[2][1][0].url

  return data.reduce((acc) => {

    let checkIndex = acc.findIndex(person => person.id === spotifyId)

    // If user exists
    if (checkIndex > -1) {
      acc[checkIndex].name = displayName
      acc[checkIndex].img = spotifyImg

    } else {
      if (!spotifyId) { return }
      const newPerson = {
        id: spotifyId,
        name: null,
        img: null,
        songs: null
      }
      acc.push(newPerson)
    }
    return acc;
  }, []);
}

/**
 * Change song object structure.
 * @data  {object} Unorganized object of Songs
 * @return {object} Organized Object of Songs
 */
const restructureSongs = (data) => {
  let songs = []
  if(data.length < 1) {
    return;
  }
  data[0][1].forEach(song => { songs.push(songObject(song)) })
  return songs
}

/**
 * Change song object structure.
 * @song  {object} Individual Song Object
 * @return {object} Restructured Song Object
 */
const songObject = (song) => {
  return {
    songName: song.name,
    songArtist: song.artists[0].name,
    duration: song.duration_ms,
    uri: song.uri
  }
}

module.exports = {
  deleteColumns,
  restructureSongs,
  restructureData
}
