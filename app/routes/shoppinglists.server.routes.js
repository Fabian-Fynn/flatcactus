'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var wgs = require('../../app/controllers/wgs.server.controller');
	var xtasklists = require('../../app/controllers/xtasklists.server.controller');
	var shoppinglists = require('../../app/controllers/shoppinglists.server.controller');

	// Shoppinglists Routes
	app.route('/shoppinglists')
		//.get(shoppinglists.list)
		.post(users.requiresLogin, shoppinglists.create);

	app.route('/shoppinglist/all-from-share')
		.get(users.requiresLogin, wgs.wgByUser, shoppinglists.getAllFromWg);

	app.route('/shoppinglists/:shoppinglistId')
		// .get(shoppinglists.read)
		.put(users.requiresLogin, wgs.wgByUser, xtasklists.checkIfAllowed, shoppinglists.update)
		.delete(users.requiresLogin, wgs.wgByUser, xtasklists.checkIfAllowed, shoppinglists.delete);

	// Finish by binding the Shoppinglist middleware
	app.param('shoppinglistId', shoppinglists.shoppinglistByID);
};
