const express = require('express')
const app = express()
var list = require("./playerDataWeek1.json")
var myteam = require("./raw_myteam.json")
var _ = require("lodash")


const getTeam = () => {
	return _.map(myteam.picks, function(player) { return _.find(list, function(el) { return el.id === player.element })})
} 

const lowestScoringPlayer = () => {
	const team = getTeam();
	const sortedTeam = _.sortBy(team, "total_points");
	return sortedTeam[0]
}

const getLowestScoringPlayers = () => {
	const team = getTeam();
	const sortedTeam = _.sortBy(team, "total_points");
	return sortedTeam.slice(0,3)
}

const getNewPlayer = (playerValue, playerPos) => {
	const newPlayers = []
	_.each(list, (player) => {
		if ((player.element_type === playerPos) && (player.now_cost <= playerValue)){
			newPlayers.push( {
				name: player.web_name,
				cost: player.now_cost,
			})
		};
		 });
	const transfer = _.sortBy(newPlayers, "total_points");
	return transfer.reverse().slice(0, 3)
}


app.get('/api/recommendations', (req, res) => {
	const lowestScoring = getLowestScoringPlayers() 
	const foundPlayers = lowestScoring.map((foundPlayer) => {
		return {
			name: foundPlayer.web_name,
			cost: foundPlayer.now_cost,
			recommendations: getNewPlayer(foundPlayer.now_cost, foundPlayer.element_type)
		}})
	res.json({playersFound: foundPlayers.length, data: foundPlayers})
})
app.listen(3000, () => console.log('Example app listening on port 3000!'))