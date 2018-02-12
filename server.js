const express = require('express')
const app = express()
var list = require("./playerDataWeek2.json")
var myteam = require("./raw_myteam.json")
var _ = require("lodash")
var cors = require('cors');

app.use(cors());

const getTeam = () => {
	return _.map(myteam.picks, function(player) { return _.find(list.elements, function(el) { 
		return el.id === player.element })})
} 

/*const lowestScoringPlayer = () => {
	const team = getTeam();
	const sortedTeam = _.sortBy(team, "total_points");
	return sortedTeam[0]
}*/

const getLowestScoringPlayers = () => {
	const team = getTeam();
	const sortedTeam = _.sortBy(team, "total_points");
	return sortedTeam.slice(0,3)
}

const getLowestScoringPlayerByPosition = (position) => {
	const team = getTeam();
	const sortedTeam = _.sortBy(team, "total_points");
	return _.find(sortedTeam, (player) => {return player.element_type == position})
}

const getNewPlayer = (playerValue, playerPos) => {
	const newPlayers = []
	_.each(list.elements, (player) => {
		if ((player.element_type === playerPos) && (player.now_cost <= playerValue)){
			newPlayers.push( {
				name: player.web_name,
				points: player.total_points,
				cost: player.now_cost,
			})
		};
		 });
	const transfer = _.sortBy(newPlayers, "points");
	return transfer.reverse().slice(0, 3)
}


app.get('/api/recommendations', (req, res) => {
	//const lowestScoring = getLowestScoringPlayers()
	const lowestScoringKeeper = getLowestScoringPlayerByPosition(1)
	const lowestScoringDef = getLowestScoringPlayerByPosition(2) 
	const lowestScoringMid = getLowestScoringPlayerByPosition(3) 
	const lowestScoringFor = getLowestScoringPlayerByPosition(4)
	const lowestScoring = [lowestScoringKeeper,lowestScoringDef,lowestScoringMid,lowestScoringFor] 
	const foundPlayers = lowestScoring.map((foundPlayer) => {
		return {
			name: foundPlayer.web_name,
			points: foundPlayer.total_points,
			cost: foundPlayer.now_cost,
			recommendations: getNewPlayer(foundPlayer.now_cost, foundPlayer.element_type)
		}})
	res.json({playersFound: foundPlayers.length, data: foundPlayers})
})
app.listen(3001, () => console.log('Example app listening on port 3001!'))