'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Xtasklist = mongoose.model('Xtasklist'),
	_ = require('lodash');

/**
 * Create a Xtasklist
 */
exports.create = function(req, res) {
	var xtasklist = new Xtasklist(req.body);
	xtasklist.user = req.user;

	xtasklist.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(xtasklist);
		}
	});
};

/**
 * Show the current Xtasklist
 */
exports.read = function(req, res) {
	res.jsonp(req.xtasklist);
};

/**
 * Update a Xtasklist
 */
exports.update = function(req, res) {
	var xtasklist = req.xtasklist ;

	xtasklist = _.extend(xtasklist , req.body);

	xtasklist.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(xtasklist);
		}
	});
};

/**
 * Delete an Xtasklist
 */
exports.delete = function(req, res) {
	var xtasklist = req.xtasklist ;

	xtasklist.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(xtasklist);
		}
	});
};

/**
 * List of Xtasklists
 */
exports.list = function(req, res) { 
	Xtasklist.find().sort('-created').populate('user', 'displayName').exec(function(err, xtasklists) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(xtasklists);
		}
	});
};

/**
 * Xtasklist middleware
 */
exports.xtasklistByID = function(req, res, next, id) { 
	Xtasklist.findById(id).populate('user', 'displayName').exec(function(err, xtasklist) {
		if (err) return next(err);
		if (! xtasklist) return next(new Error('Failed to load Xtasklist ' + id));
		req.xtasklist = xtasklist ;
		next();
	});
};

/**
 * Xtasklist authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.xtasklist.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
