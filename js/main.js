require('../less/style.less')
import _ from 'lodash'
import loginView from './templates/login.ejs'
import mainView from './templates/mainpage.ejs'
import login from './components/login.js'
import mainpage from './components/mainpage.js'
import render from './utils/render.js'

// Initialize Firebase
const config = {
  apiKey: "AIzaSyCvX-9BBppyTcO_x7B-s6bBlxSxCcAQtXA",
  authDomain: "wc2018-be3df.firebaseapp.com",
  databaseURL: "https://wc2018-be3df.firebaseio.com",
  projectId: "wc2018-be3df",
  storageBucket: "",
  messagingSenderId: "436391509301"
};
firebase.initializeApp(config);

const checkLogin = () => {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      sessionStorage.setItem('userid', user.uid)
      render(document.getElementById('page'),mainView({
        user:user
      }));
      mainpage()
    } else {
      render(document.getElementById('page'),loginView());
      login()
    }
  });
}

window.onload = () => {
 checkLogin()
}