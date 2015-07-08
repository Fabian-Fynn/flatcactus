'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	User = mongoose.model('User');

exports.index = function(req, res) {
	res.render('index', {
		user: req.user || null,
		request: req
	});

	//Set socket_id in Usermodel
	var socketio = req.app.get('socketio');
	socketio.on('connection', function(sock){
		var user = req.session.passport.user;
		if(user){
			User.setSocketById(user, sock.id);
		}
	});
};
