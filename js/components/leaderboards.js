import render from '../utils/render.js'
import leaderboards from '../templates/leaderboards.ejs'
import firebase from 'firebase'
import axios from 'axios'
const matchUrl = 'https://raw.githubusercontent.com/openfootball/world-cup.json/master/2018/worldcup.json'

let matchData;
let playerScore = 0
let scoreList = []

const points = {
  'match': 2,
  'score': 1
}

export default () => {
  loadBetsData()
  loadMatchData()
}

const loadBetsData = () => {
  firebase.database().ref('bets/').once('value',(res) => {
    const users = _.values(res.val())
    const ordered = _.orderBy(users,'points','desc')
    render(document.getElementById('matchlist'),leaderboards({
      data: ordered
    }));
  })
}

const loadMatchData = () => {
  axios.get(matchUrl)
  .then(function (response) {
    matchData = response.data
    userBets(true)
  })
  .catch(function (error) {
    console.log(error);
  });
}

const userBets = (updateScores) => {
  const uid = sessionStorage.getItem('userid')
  firebase.database().ref('bets/' + uid).once('value',(res) => {
    if(res.val().matches) {
      combineMatchData(res.val())
    }
    if(updateScores) {
      checkScores(matchData)
    }
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

const checkScores = (data) => {
  playerScore = 0
  scoreList = []
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