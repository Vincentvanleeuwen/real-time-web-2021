# **Combinify**
### Real time web @cmda-minor-web 2020 - 2021


https://combinify-node.herokuapp.com

Combinify is a playlist creating application that lets you create a combined playlist of multiple people their top songs.
This application will be made without the use of Javascript Frameworks.

People can join a playlist room, once everyone has joined, you can combine all your top songs into one single playlist.

Check out the prototype @ https://xd.adobe.com/view/19b3c8d4-05bd-4ac2-ad30-a6d7686fc173-4ce0/?fullscreen&hints=off

## Learning goals

* _Adding realtime functionalities to a project
* _Combining multiple playlists with the Spotify API

## Installation guide

```jsx
 cd C:/DesiredMap
 git clone https://github.com/Vincentvanleeuwen/progressive-web-apps-2021.git
```

For security reasons, the spotify key has not been included, feel free to create your own for free.

[Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
> Create an app

> Copy the Client ID, Client Secret, and Redirect URL

> Create an .env in the main folder

```jsx
// .env
CLIENTID=PLACE-CLIENT-ID-HERE;
CLIENTSECRET=PLACE-CLIENT-SECRET-HERE
REDIRECTURL=http://localhost:3000/callback
```

To run the project locally you will need nodejs.
```jsx

 
 // Go to the correct folder
 cd C:/{DesiredMap}/progressive-web-apps-2021
 
  // Install dependencies
 npm i
 // Run the server 
 npm run test
```
You can now preview the project when visiting http://localhost:3000

<!-- ...but how does one use this project? What are its features 🤔 -->
## Features

A playlist is created based on each of the people's top tracks.

The user will be able to set the amount of songs or playlist length and a playlist name to start.

You can add however many other profiles as you'd like.

I will allow users to delete songs from the playlist.



## External Data

The [Spotify API](https://developer.spotify.com/documentation/web-api/) will be used in this project to get a list of a couple people's top tracks. 

There are four ways of authorization spotify. 
Refreshable user authorization like
- [Authorization Code Flow](https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow)
- [Authorization Code Flow With Proof Key for Code Exchange (PKCE)](https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow-with-proof-key-for-code-exchange-pkce)
- [Client Credentials Flow](https://developer.spotify.com/documentation/general/guides/authorization-guide/#client-credentials-flow)

or Temporary user authorization
- [Implicit Grant](https://developer.spotify.com/documentation/general/guides/authorization-guide/#implicit-grant-flow)

Because I'm using node js now, I will be using the authorization code flow from spotify.
```jsx
const options = {
  headers: {
    'Authorization': 'Bearer ' + _token,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  json: true
}
  fetch('https://api.spotify.com/v1/me/top/tracks', options).then(response => {
    return response.json()
  }).then(data => {
    console.log('data', data); // Returns an object with 20 tracks in it
  })
```

Check out the [Reference](https://developer.spotify.com/documentation/web-api/reference/) page for further explanation on what links to get what data from.

## Checklist
- [x] Connect to the spotify API
- [x] Get the top tracks of the logged in user
- [x] Create a playlist
- [x] Add songs to the playlist
- [x] Set playlist name
- [x] Set max amount of songs
- [x] Visit other peoples lists
- [x] Add songs to a playlist
- [ ] Add more profiles
- [ ] Check out each profiles addition
- [ ] Delete songs from a playlist
<!-- How about a license here? 📜 (or is it a licence?) 🤷 -->
## Sources

[The one and only Jonah Gold](https://github.com/theonejonahgold)

[Wouter](https://github.com/Mokerstier) 

[Ben](https://github.com/benl95)

[Roeland](https://github.com/roelandvs)

[Generate a random string](https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript)
