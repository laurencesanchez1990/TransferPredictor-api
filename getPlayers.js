var list = require("./playerDataWeek1.json")
var myteam = require("./raw_myteam.json")
var _ = require("lodash")




var newteam = _.map(myteam.picks, function(player) { return _.find(list, function(el) { return el.id === player.element })})
console.log(newteam)