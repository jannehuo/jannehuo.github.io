const dev = checkQueryString('dev');
const matchUrl = dev ? '../js/testData.json' : 'https://raw.githubusercontent.com/openfootball/world-cup.json/master/2018/worldcup.json'
import axios from 'axios'
import render from '../utils/render.js'
import matchlist from '../templates/matchlist.ejs'
let matchData;
let playerScore = 0;
let scoreList = []

const points = {
  'match': 2,
  'score': 1
}

export default () => {
  playerScore = 0
  scoreList = []
  loadMatchData()
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
        playerScore = 0;
        scoreList = []
        userBets()
      }
    });
  }

  return false;
}

const userBets = () => {
  const uid = sessionStorage.getItem('userid')
  firebase.database().ref('bets/' + uid).once('value',(res) => {
    if(res.val().matches) {
      combineMatchData(res.val())
    }
    renderMatchData(matchData)
    checkScores(matchData)
  })
}

const combineMatchData = (bets) => {
  let betsList;
  
  if(_.isArray(bets.matches)) {
    betsList = _.compact(bets.matches)
  } else {
    betsList = _.values(bets.matches)
  }
  
  _.each(matchData.rounds,(round) => {
    _.each(round.matches,(match) => {
      _.each(betsList,(bet) => {
        if(parseInt(bet.num,10) === match.num) {
          match.bet = bet
        }
      })
    })
  })
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

const checkScores = (data) => {
  _.each(data.rounds,(round) => {
    _.each(round.matches,(match) => {
      if(match.bet && match.score1 !== null && match.score2 !== null) {
        checkBets(match)
      }
    })
  })
  saveUserScore(playerScore)
}

const checkBets = (match) => {
  if(match.score1 === match.score2 && convertToInt(match.bet.bet1) === convertToInt(match.bet.bet2)) {
    playerScore += points.match
    scoreList.push(points.match)
    if(match.score1 === convertToInt(match.bet.bet1) && match.score2 === convertToInt(match.bet.bet2)) {
      playerScore += points.score
      scoreList.push(points.score)
      return false;
    }
  }
  if(match.score1 > match.score2 && convertToInt(match.bet.bet1) > convertToInt(match.bet.bet2)) {
    playerScore += points.match
    scoreList.push(points.match)
    if(match.score1 === convertToInt(match.bet.bet1) && match.score2 === convertToInt(match.bet.bet2)) {
      playerScore += points.score
      scoreList.push(points.score)
    }
    return false;
  }
  if(match.score2 > match.score1 && convertToInt(match.bet.bet2) > convertToInt(match.bet.bet1)) {
    playerScore += points.match
    scoreList.push(points.match)
    if(match.score1 === convertToInt(match.bet.bet1) && match.score2 === convertToInt(match.bet.bet2)) {
      playerScore += points.score
      scoreList.push(points.score)
    }
    return false;
  }
}

const convertToInt = (val) => {
  return parseInt(val,10)
}

const saveUserScore = (score) => {
  const uid = sessionStorage.getItem('userid')
  firebase.database().ref('bets/' + uid + '/points/').set(score,(err) => {
    if(err) {
      console.log(err)
    } else {
      document.getElementById('user-score').innerHTML = playerScore + ' P'
      sessionStorage.setItem('scoresSaved','saved')
    }
  });
}



function checkQueryString(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}