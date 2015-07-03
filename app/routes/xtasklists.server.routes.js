'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var wgs = require('../../app/controllers/wgs.server.controller');
	var xtasklists = require('../../app/controllers/xtasklists.server.controller');

	// Xtasklists Routes
	app.route('/xtasklists')
		//.get(xtasklists.list)
		.post(users.requiresLogin, xtasklists.create);

	app.route('/xtasklists/:xtasklistId')
		.get(users.requiresLogin, wgs.wgByUser, xtasklists.checkIfAllowed, xtasklists.read)
		.put(users.requiresLogin, wgs.wgByUser, xtasklists.checkIfAllowed, xtasklists.update)
		.delete(users.requiresLogin, wgs.wgByUser, xtasklists.checkIfAllowed, xtasklists.delete);

	app.route('/xtasklist/all-from-share')
		.get(users.requiresLogin, wgs.wgByUser, xtasklists.getAllFromWg);

	// Finish by binding the Xtasklist middleware
	app.param('xtasklistId', xtasklists.xtasklistByID);
};
