'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var wgs = require('../../app/controllers/wgs.server.controller');
	var payments = require('../../app/controllers/payments.server.controller');

	// Payments Routes
	app.route('/payments')
		.get(payments.list)
		.post(users.requiresLogin, payments.create);

	app.route('/payments/:paymentId')
		.get(payments.read)
		.put(users.requiresLogin, payments.hasAuthorization, payments.update)
		.delete(users.requiresLogin, payments.hasAuthorization, payments.delete);

	app.route('/payment/all-from-share')
			.get(users.requiresLogin, wgs.wgByUser, payments.getAllFromWg);
	// Finish by binding the Payment middleware
	app.param('paymentId', payments.paymentByID);
};
