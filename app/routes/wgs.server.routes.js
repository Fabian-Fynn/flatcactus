'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var wgs = require('../../app/controllers/wgs.server.controller');

	// Wgs Routes
	app.route('/wgs')
		// .get(users.requiresLogin, wgs.list)
		.post(users.requiresLogin, wgs.create);

	app.route('/my-share/allusers')
		.get(users.requiresLogin, wgs.wgByUser, users.getAllFromWg);

	app.route('/my-share')
		.get(users.requiresLogin, wgs.wgByUser, wgs.read);

	app.route('/wgs/join')
		.post(users.requiresLogin, wgs.join);

	app.route('/wgs/:wgId')
		.get(users.requiresLogin, wgs.read)
		.put(users.requiresLogin, wgs.hasAuthorization, wgs.update)
		.delete(users.requiresLogin, wgs.hasAuthorization, wgs.delete);

	app.route('/my-share/leave')
		.put(users.requiresLogin, wgs.isAllowedToLeave, wgs.removeUser);

	// Finish by binding the Wg middleware
	app.param('wgId', wgs.wgByID);
};
