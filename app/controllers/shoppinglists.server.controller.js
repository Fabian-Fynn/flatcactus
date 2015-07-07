'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Shoppinglist = mongoose.model('Shoppinglist'),
	_ = require('lodash');

/**
 * Create a Shoppinglist
 */
exports.create = function(req, res) {
	var shoppinglist = new Shoppinglist(req.body);

	shoppinglist.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(shoppinglist);
		}
	});
};

/**
 * Show the current Shoppinglist
 */
exports.read = function(req, res) {
	res.jsonp(req.shoppinglist);
};

/**
 * Update a Shoppinglist
 */
exports.update = function(req, res) {
	var shoppinglist = req.shoppinglist ;

	shoppinglist = _.extend(shoppinglist , req.body);

	shoppinglist.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(shoppinglist);
		}
	});
};

/**
 * Delete an Shoppinglist
 */
exports.delete = function(req, res) {
	var shoppinglist = req.shoppinglist ;

	shoppinglist.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(shoppinglist);
		}
	});
};

/**
 * List of Shoppinglists
 */
exports.list = function(req, res) {
	Shoppinglist.find().sort('-created').populate('user', 'displayName').exec(function(err, shoppinglists) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(shoppinglists);
		}
	});
};

exports.getAllFromWg = function(req,res){
	var date = new Date(); // date a week ago
	var last = new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000));

	Shoppinglist.where({wg_id: req.wg._id, $or: [{ done_when: { $gte: last }}, { done_when: null }]}).sort('-created').exec(function(err, shop) {
		if (err) {
			console.log('getallshoppingitems');
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(shop);
		}
	});
};

/**
 * Shoppinglist middleware
 */
exports.shoppinglistByID = function(req, res, next, id) {
	Shoppinglist.findById(id).populate('user', 'displayName').exec(function(err, shoppinglist) {
		if (err) return next(err);
		if (! shoppinglist) return next(new Error('Failed to load Shoppinglist ' + id));
		req.shoppinglist = shoppinglist ;
		next();
	});
};

/**
 * Shoppinglist authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.shoppinglist.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
