'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Wg = mongoose.model('Wg'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create a Wg
 */
exports.create = function(req, res) {
	var wg = new Wg(req.body);
	wg.users.push(req.user._id);
	console.log('reqUser', req.user);
	console.log('wg._id', wg._id);
	User.update({ _id: req.user.id }, { $set: { wg_id: wg._id }}, function(error, doc){
		console.log(error);
		console.log(doc);
		
	});
	wg.created_from = req.user.username;

	wg.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(wg);
		}
	});
};

/**
 * Show the current Wg
 */
exports.read = function(req, res) {
	res.jsonp(req.wg);
};

/**
 * Update a Wg
 */
exports.update = function(req, res) {
	var wg = req.wg ;

	wg = _.extend(wg , req.body);

	wg.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(wg);
		}
	});
};

/**
 * Delete an Wg
 */
exports.delete = function(req, res) {
	var wg = req.wg ;

	wg.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(wg);
		}
	});
};

/**
 * List of Wgs
 */
exports.list = function(req, res) {
	Wg.find().sort('-created').populate('user', 'displayName').exec(function(err, wgs) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(wgs);
		}
	});
};

/**
 * Wg middleware
 */
exports.wgByID = function(req, res, next, id) {
	Wg.findById(id).populate('user', 'displayName').exec(function(err, wg) {
		if (err) return next(err);
		if (! wg) return next(new Error('Failed to load Wg ' + id));
		req.wg = wg ;
		next();
	});
};

/**
 * Wg authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.wg.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
