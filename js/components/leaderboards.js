import render from '../utils/render.js'
import leaderboards from '../templates/leaderboards.ejs'
import firebase from 'firebase'

export default () => {
  loadBetsData()
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