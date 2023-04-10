const fb = require('firebase/app')
require('firebase/database')

const firebaseConfig = {
  apiKey: "AIzaSyDnBaT31_LbWAjiRd7isQ1pPdiDVD1HmtQ",
  authDomain: "combinify-b1222.firebaseapp.com",
  databaseURL: "combinify-b1222-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "combinify-b1222",
  storageBucket: "combinify-b1222.appspot.com",
  messagingSenderId: "274350746286",
  appId: "1:274350746286:web:ee843bfbd1f420cb235b3f",
  measurementId: "G-1PDBZFE48J"
};
const firebase = !fb.apps.length ? fb.initializeApp(firebaseConfig) : fb.app()

module.exports = { firebase }
