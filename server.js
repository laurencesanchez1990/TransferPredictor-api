const express = require('express')
const app = express()
var list = require("./playerDataWeek1.json")
var myteam = require("./raw_myteam.json")
var _ = require("lodash")


const getTeam = () => {
	return _.map(myteam.picks, function(player) { return _.find(list, function(el) { return el.id === player.element })})
} 

const getLowestScoringPlayers = () => {
	const team = getTeam();
	const sortedTeam = _.sortBy(team, "total_points");
	return sortedTeam[0]
}

const getNewPlayer = (playerValue, playerPos) => {
	const newPlayers = _.filter(list, (player) => {return (player.element_type === playerPos) && (player.now_cost <= playerValue); });
	console.log(newPlayers)
	const transfer = _.sortBy(newPlayers, "total_points");
	return transfer.reverse()
}


app.get('/api/recommendations', (req, res) => {
	const lowestScoringPlayer = getLowestScoringPlayers() 
	const newPlayers = getNewPlayer(lowestScoringPlayer.now_cost, lowestScoringPlayer.element_type)
	res.json({playersFound: newPlayers.length, playerCost: lowestScoringPlayer.now_cost, playerPos: lowestScoringPlayer.element_type, data: newPlayers})
})
app.listen(3000, () => console.log('Example app listening on port 3000!'))