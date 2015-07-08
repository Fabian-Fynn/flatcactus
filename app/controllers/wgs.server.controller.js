'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	crypto = require('crypto'),
	Wg = mongoose.model('Wg'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create a Wg
 */
exports.create = function(req, res) {
	var wg = new Wg(req.body);
	wg.users.push(req.user._id);
	wg.created_from = req.user.username;

	User.update({ _id: req.user.id }, { $set: { wg_id: wg._id }}, function(error, doc){
		if(error) console.log(error);
		console.log('user update, added wgID');
	});

	wg.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(wg);
		}
	});
};

exports.join = function(req, res) {
	var wg, user;

	wg = Wg.findOne({ 'passphrase': req.body.pass }, function(err, wg) {
		if(err){ 
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		if(wg === null){
			return res.status(400).send({
				message: 'No flat with this passphrase found!'
			});
		}

		Wg.update({ _id: wg._id },{ $push: { users: req.user._id }}, function(){});

		user = User.update({ _id: req.user._id }, { $set: { wg_id: wg._id }}, function(error, user){
			if(err){ 
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			}
		});

		return res.json(wg);
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
			User.update({ _id: req.user._id }, { $set: { wg_id: null }}, function(error, user){
				if(error){ 
					console.log('error');
					return res.status(400).send({
						message: errorHandler.getErrorMessage(error)
					});
				}
				res.jsonp(user);
			});
		}
	});
};

exports.removeUser = function(req, res) {
	var wg = req.body;

	var newPass = crypto.randomBytes(16).toString('base64');

	Wg.update({ _id: wg._id },{ $set: { users: wg.users, passphrase: newPass }}, function(error,wg){
		console.log('update users');
		if(error){ console.log('error'); }
	});

	User.update({ _id: req.user._id }, { $set: { wg_id: null, balance: 0 }}, function(error, user){
		if(error){ 
			console.log('error');
			return res.status(400).send({
			message: errorHandler.getErrorMessage(error)
			});
		}
		res.jsonp(user);
	});
};

/**
 * List of Wgs
 */
// exports.list = function(req, res) {
// 	var wg = Wg.where({ _id: req.user.wg_id });
// 	console.log('wg', wg);
// 		if (!wg) {
// 			return res.status(400).send({
// 				message: errorHandler.getErrorMessage(err)
// 			});
// 		} else {
// 			res.jsonp(wg);
// 		}
// };

/**
 * Wg middleware
 */
exports.wgByID = function(req, res, next, id) {
	Wg.findById(id).populate('user', 'displayName').exec(function(err, wg) {
		if (err) return next(err);
		if (! wg) return next(new Error('Failed to load flat-share ' + id));
		req.wg = wg;
		next();
	});
};

exports.wgByUser = function(req, res, next) {
	if(!req.user.wg_id){
		next();
	} else {
		Wg.findById(req.user.wg_id).exec(function(err, wg) {
			if(err) return next(err);
			if(!wg) return next(new Error('Failed to load'));
			req.wg = wg;
			next();
		});
	}
};

exports.wgByPass = function(req, res, next, pass) {
	Wg.findOne({'passphrase': pass}, function(err, wg) {
		if(err) return next(err);
		if(!wg) return next(new Error('Failed to find flat-share with that passphrase'));
		req.wg = wg;
		next();
	});
};

function isUserInWg(myArray, searchTerm) {
    for(var i = 0; i < myArray.length; i++) {
        if (myArray[i].toString() === searchTerm) return true;
    }
    return false;
}

/**
 * Wg authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	// if (req.wg.user.id !== req.user.id) {
	// 	return res.status(403).send('User is not authorized');
	// }

	if(!isUserInWg(req.wg.users, req.user.id)){
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.isAllowedToLeave = function(req, res, next) {
	if(req.user.wg_id.toString() !== req.body._id.toString()) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
