const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.userData = functions.auth.user().onCreate((user) => {
  const email = user.data.email; // The email of the user.
  const displayName = user.data.displayName; // The display name of the user.
  const userId = user.data.uid;
  const userObj = {
    displayName:displayName,
    email:email,
    userId:userId
  }
  console.log('OBJ' , userObj)
  return admin.database().ref('bets/' + userId).set(userObj);
});