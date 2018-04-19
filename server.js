const express = require('express')
const app = express()
var list = require("./playerDataWeek8.json")
var myteam = require("./raw_myteam.json")
var _ = require("lodash")
var cors = require('cors');
var db = require("./logins.json");
const bodyParser = require('body-parser');
var fs = require("fs")

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const getTeam = (selectedTeam) => {
	selectedTeam = selectedTeam || myteam.picks;
	return _.map(selectedTeam, function (player) {
		const playerId = _.isObject(player) ? player.element : player;
		return _.find(list.elements, function (el) {
			return el.id == playerId;
		})
	})
}

/*const lowestScoringPlayer = () => {
	const team = getTeam();
	const sortedTeam = _.sortBy(team, "total_points");
	return sortedTeam[0]
}*/

const getLowestScoringPlayers = () => {
	const team = getTeam();
	console.info('team', team)
	const sortedTeam = _.sortBy(team, "total_points");
	return sortedTeam.slice(0, 3)
}

const getLowestScoringPlayerByPosition = (position, playerIds) => {
	const team = getTeam(playerIds);
	console.info(team)
	const sortedTeam = _.sortBy(team, "total_points");
	return _.find(sortedTeam, (player) => { return player.element_type == position })
}

const getNewPlayer = (playerValue, playerPos) => {
	const newPlayers = []
	_.each(list.elements, (player) => {
		if ((player.element_type === playerPos) && (player.now_cost <= playerValue)) {
			newPlayers.push({
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
	const lowestScoringKeeper = getLowestScoringPlayerByPosition(1)
	const lowestScoringDef = getLowestScoringPlayerByPosition(2)
	const lowestScoringMid = getLowestScoringPlayerByPosition(3)
	const lowestScoringFor = getLowestScoringPlayerByPosition(4)
	const lowestScoring = [lowestScoringKeeper, lowestScoringDef, lowestScoringMid, lowestScoringFor]
	// console.info(lowestScoring)

	const foundPlayers = lowestScoring.map((foundPlayer) => {
		return {
			name: foundPlayer.web_name,
			points: foundPlayer.total_points,
			cost: foundPlayer.now_cost,
			recommendations: getNewPlayer(foundPlayer.now_cost, foundPlayer.element_type)
		}
	})
	res.json({ playersFound: foundPlayers.length, data: foundPlayers })
})

app.post('/api/recommendations', (req, res) => {
	console.log(req.body.players)
	const players = JSON.parse(req.body.players)
	const lowestScoringKeeper = getLowestScoringPlayerByPosition(1, players)
	const lowestScoringDef = getLowestScoringPlayerByPosition(2, players)
	const lowestScoringMid = getLowestScoringPlayerByPosition(3, players)
	const lowestScoringFor = getLowestScoringPlayerByPosition(4, players)
	const lowestScoring = [lowestScoringKeeper, lowestScoringDef, lowestScoringMid, lowestScoringFor]
	console.info(lowestScoring)
	const foundPlayers = lowestScoring.map((foundPlayer) => {
		return {
			name: foundPlayer.web_name,
			points: foundPlayer.total_points,
			cost: foundPlayer.now_cost,
			recommendations: getNewPlayer(foundPlayer.now_cost, foundPlayer.element_type)
		}
	})
	res.json({ playersFound: foundPlayers.length, data: foundPlayers })
})

app.post('/api/Login', (req, res) => {
	console.log(db);
	fs.readFile('./logins.json', 'utf8', function(err, data) { 
		if(err) { return console.info('this has errored', err) }
	const loginResult = db.Logins.find((login) => {
		console.log(req.body.email, req.body.password)
		console.log(login.email, login.password)
		return (login.email == req.body.email && login.password == req.body.password)
	})
	if (loginResult) {
		return res.status(200).end();
	}
	return res.status(401).end();
})
})


app.post('/api/registration', (req, res) => {
	//req is data from client
	fs.readFile('./logins.json', 'utf8', function(err, data) { 
		if(err) { return console.info('this has errored', err) }
		console.info('data', data);
		const registrationResult = db.Logins.find((login) => {
			console.log(login.email, login.password, login.first_name, login.lastname)
			console.log(req.body.email, req.body.password, req.body.first_name, req.body.last_name)
			return (login.email == req.body.email)
		})
		if (registrationResult) {
			return res.status(401).end();
		}
		const parsedData = JSON.parse(data);
		parsedData.Logins.push({email: req.body.email, password: req.body.password, first_name: req.body.first_name, last_name: req.body.last_name});
		
		fs.writeFile('logins.json', JSON.stringify(parsedData), function (err) {
			if (err) throw err;
			console.log('Replaced!');
			return res.status(200).end();
		  });
		
	});
})

app.get('/api/playerDataWeek8', (req, res) => {
	return res.json(list);
})

app.listen(3001, () => console.log('Example app listening on port 3001!'))
