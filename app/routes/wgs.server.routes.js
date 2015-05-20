'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var wgs = require('../../app/controllers/wgs.server.controller');

	// Wgs Routes
	app.route('/wgs')
		.get(users.requiresLogin, wgs.isHisWg, wgs.list)
		.post(users.requiresLogin, wgs.create);

	app.route('/wgs/:wgId')
		.get(wgs.read)
		.put(users.requiresLogin, wgs.hasAuthorization, wgs.update);
		//.delete(users.requiresLogin, wgs.hasAuthorization, wgs.delete);

	// Finish by binding the Wg middleware
	app.param('wgId', wgs.wgByID);
};
