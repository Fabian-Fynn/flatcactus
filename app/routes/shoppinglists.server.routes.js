'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var shoppinglists = require('../../app/controllers/shoppinglists.server.controller');

	// Shoppinglists Routes
	app.route('/shoppinglists')
		//.get(shoppinglists.list)
		.post(users.requiresLogin, shoppinglists.create);

	app.route('/shoppinglists/:shoppinglistId')
		.get(shoppinglists.read)
		.put(users.requiresLogin, shoppinglists.hasAuthorization, shoppinglists.update)
		.delete(users.requiresLogin, shoppinglists.hasAuthorization, shoppinglists.delete);

	// Finish by binding the Shoppinglist middleware
	app.param('shoppinglistId', shoppinglists.shoppinglistByID);
};
