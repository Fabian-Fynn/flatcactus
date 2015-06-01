'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var xtasklists = require('../../app/controllers/xtasklists.server.controller');

	// Xtasklists Routes
	app.route('/xtasklists')
		.get(xtasklists.list)
		.post(users.requiresLogin, xtasklists.create);

	app.route('/xtasklists/:xtasklistId')
		.get(xtasklists.read)
		.put(users.requiresLogin, xtasklists.hasAuthorization, xtasklists.update)
		.delete(users.requiresLogin, xtasklists.hasAuthorization, xtasklists.delete);

	// Finish by binding the Xtasklist middleware
	app.param('xtasklistId', xtasklists.xtasklistByID);
};
