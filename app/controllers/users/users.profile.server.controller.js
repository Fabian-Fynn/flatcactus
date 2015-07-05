'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Wg = mongoose.model('Wg');

exports.updateMotd = function(req, res) {
	var user = req.user;
	user.motd = req.body.motd;
	user.save();
};
/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Delete User
 */
exports.deleteData = function(req, res) {
	console.log('req.user', req.user);
	var user = req.user;

	user.remove(function(err) {
		if (err) {
			console.log('error bei user remove');
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			if(user.wg_id) {
				console.log('has wg_id');
				Wg.update({ _id: user.wg_id },{ $pull: { users: user }}, function(err){
					if(err){
						console.log('error bei wg update');
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					}
				});
			}
			console.log('req.logout');
			req.logout();
			res.json(user);
		}
	});

};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};

/*
 * Get all users from wg
 */
exports.getAllFromWg = function(req, res) {
	var users = req.wg.users;

	User.find({ '_id': { $in: users} }, function(err, docs){
			if(err){
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
			return res.json(docs);
	});

};
