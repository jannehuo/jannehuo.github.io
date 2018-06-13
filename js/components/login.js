const provider = new firebase.auth.GoogleAuthProvider();

export default () => {
  document.getElementById('login').addEventListener('click',loginUser,false)
}

const loginUser = (e) => {
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    // ...
  }).catch(function(error) {
    console.log(error)
  });
}