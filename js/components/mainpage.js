const matchUrl = 'https://raw.githubusercontent.com/openfootball/world-cup.json/master/2018/worldcup.json'
import axios from 'axios'
import render from '../utils/render.js'
import matchlist from '../templates/matchlist.ejs'
let matchData;

export default () => {
  loadMatchData()
  document.getElementById('logout').addEventListener('click',logout,false)
}

const loadMatchData = () => {
  axios.get(matchUrl)
  .then(function (response) {
    matchData = response.data
    userBets()
  })
  .catch(function (error) {
    console.log(error);
  });
}

const renderMatchData = (data) => {
  console.log(data)
  render(document.getElementById('matchlist'),matchlist({
    data:data
  }))
  const betForms = document.getElementsByClassName('bettingform');
  _.each(betForms,(form) => {
    form.addEventListener('submit',addUserBet,false)
  })
}

const addUserBet = (e) => {
  e.preventDefault();
  const current = e.currentTarget
  const matchnum = current.getAttribute('data-match-num')
  const roundI = current.getAttribute('data-round-index')
  const matchI = current.getAttribute('data-match-index')
  const picked = matchData.rounds[roundI].matches[matchI]
  const formdata = new FormData(current)
  let object = {
    num: matchnum
  };
  formdata.forEach(function(value, key){
    object[key] = value;
  });
  const uid = sessionStorage.getItem('userid')
  const emptyStrings = _.includes(_.values(object),"");

  if(!emptyStrings) {
    firebase.database().ref('bets/' + uid + '/matches/' + matchnum).set(object,(err) => {
      if(err) {
        showStatus(false)
      } else {
        showStatus(true)
      }
    });
  }

  return false;
}

const userBets = () => {
  const uid = sessionStorage.getItem('userid')
  firebase.database().ref('bets/' + uid).on('value',(res) => {
    combineMatchData(res.val())
  })
}

const combineMatchData = (bets) => {
  const betsList = _.compact(bets.matches)
  _.each(matchData.rounds,(round) => {
    _.each(round.matches,(match) => {
      _.each(betsList,(bet) => {
        if(parseInt(bet.num,10) === match.num) {
          match.bet = bet
        }
      })
    })
  })
  renderMatchData(matchData)
}

const logout = (e) => {
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
  }).catch(function(error) {
    // An error happened.
  });
}

const showStatus = (success) => {
  const notification = document.getElementById('notification')
  const statusClass = success ? 'success' : 'error'
  const content = success ? 'Bet Added!' : 'Error try again!'
  notification.classList.add(statusClass)
  notification.innerHTML = content
  setTimeout(() => {
    notification.classList.remove(statusClass)
    notification.innerHTML = ''
  },1500);
}