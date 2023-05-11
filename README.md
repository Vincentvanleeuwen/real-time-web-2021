# **Combinify**
### Real-time-web @cmda-minor-web 2020 - 2021

## CONCEPT

combinify-shoockz.b4a.run/

Combinify is a playlist creating application that lets you create a combined playlist of multiple people their top songs.

Check out the prototype @ https://xd.adobe.com/view/19b3c8d4-05bd-4ac2-ad30-a6d7686fc173-4ce0/?fullscreen&hints=off

## Frameworks

- Firebase
- SocketIO
- Express

## Layout and Animations

I've created three prototypes. If I had to choose for a design I would go with concept number two. 
I had to make time for other problems in the application so I've decided to go with the third concept since it takes me a little less time. If I have time over I will create the second concept.
The first concept wasn't really that scalable, the vertical aspect fits better in this type of application.

### Concept One

https://xd.adobe.com/view/3616615a-146f-44ae-9884-1a89ac6676f8-6345/?fullscreen

### Concept Two

https://xd.adobe.com/view/64aed2de-98cb-4403-94e9-bf3c66a4b170-31fd/

### Concept Three

https://xd.adobe.com/view/e057ad6b-1979-4372-a4e3-c0122ec36462-b504/

## Learning goals

* _Being able to implement socket io into an existing project

* _Understanding rooms in socket io

* _Using Firebase together with socket io to create animations in real-time

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

   const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')),
        'Content-Type': 'application/x-www-urlencoded'
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {

      if (error || response.statusCode !== 200) {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          })
        );
        return
      }

      req.session.access_token = body.access_token
      req.session.refresh_token = body.refresh_token
      req.session.save();

      res.redirect('/home' );
    });
```

Check out the [Reference](https://developer.spotify.com/documentation/web-api/reference/) page for further explanation on what links to get what data from.

## Data life cycle

![Data Life Cycle](https://github.com/Vincentvanleeuwen/real-time-web-2021/blob/main/images/datalifecycle.jpg)

## Checklist
- [x] Connect to the spotify API
- [x] Get the top tracks of the logged in user
- [x] Create a playlist
- [x] Add songs to the playlist
- [x] Set playlist name
- [x] Set max amount of songs
- [x] Add songs to a playlist
- [x] Add more profiles
- [x] View other peoples top tracks
- [x] Delete songs from a playlist
- [ ] Add animations on songs added

<!-- How about a license here? 📜 (or is it a licence?) 🤷 -->
## Sources

[The one and only Jonah Gold](https://github.com/theonejonahgold)

[Generate a random string](https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript)
