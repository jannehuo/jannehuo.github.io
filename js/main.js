require('../less/style.less')
import _ from 'lodash'
import loginView from './templates/login.ejs'
import mainView from './templates/mainpage.ejs'
import login from './components/login.js'
import mainpage from './components/mainpage.js'
import render from './utils/render.js'
import init from './init.js'
import leaderboards from './components/leaderboards.js';

init()

const checkLogin = () => {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      sessionStorage.setItem('userid', user.uid)
      renderPageContainer(user)
      initRouter()
    } else {
      render(document.getElementById('page'),loginView());
      login()
    }
  });
}

const renderPageContainer = (user) => {
  render(document.getElementById('page'),mainView({
    user:user
  }));
  document.getElementById('logout').addEventListener('click',logout,false)
  document.getElementById('openmenu').addEventListener('click',openMenu,false)
  document.getElementById('closemenu').addEventListener('click',closeMenu,false)
  const navLinks = document.getElementsByClassName('nav-link')
  _.each(navLinks,(link) => {
    link.addEventListener('click',navLinkClick,false)
  })
}

const initRouter = () => {
  routie({
    '': function() {
      mainpage()
    },
    'leaderboards': function() {
      leaderboards()
    }
  })
}

const openMenu = (e) => {
  document.getElementById('menu').classList.add('open')
}

const closeMenu = (e) => {
  document.getElementById('menu').classList.remove('open')
}

const logout = (e) => {
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });
}

const checkMenuStatus = (e) => {
  const menu = document.getElementById('menu')
  if(menu) {
    if(menu.classList.contains('open')) {
      menu.classList.remove('open')
    }
  }
}

const navLinkClick = (e) => {
  checkMenuStatus()
}

checkLogin()