'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	multiparty = require('multiparty'),
	uuid = require('node-uuid'),
	fs = require('fs'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User'),
	Wg = mongoose.model('Wg');

exports.updateMotd = function(req, res) {
	var user = req.user;
	var response = {};

	user.motd = req.body.motd;
	user.save();

	response.user = user;
	response.order = req.body.order;
	Wg.notifyUsers(req.app.get('socketio'), req.user.wg_id, 'motd.update', response);
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
			req.logout();
			res.json(user);
		}
	});

};

exports.profilePhoto = function(req, res){
	var form = new multiparty.Form();

	form.parse(req, function(err, fields, files) {
		console.log('files', files);

		var user = req.user;
		var oldAvatar = user.avatar;
		var file = files.file[0];

		var contentType = file.headers['content-type'];
		var tmpPath = file.path;
		var extIndex = tmpPath.lastIndexOf('.');
		var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
		// uuid is for generating unique filenames.
		var fileName = uuid.v4() + extension;
		var destPath = process.cwd() + '/public/uploads/' + fileName;

		// Server side file type checker.
		if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
				fs.unlink(tmpPath);
				return res.status(400).send('Unsupported file type.');
		}

		var is = fs.createReadStream(tmpPath);
		var os = fs.createWriteStream(destPath);

		if(is.pipe(os)) {
				fs.unlink(tmpPath, function (err) { //To unlink the file from temp path after copy
						if (err) {
								res.status(400).send('Image cannot be saved. Error while writing.');
						}
				});
				// update current user model
				user.avatar = '/uploads/' + fileName;
				user.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					}
					if(oldAvatar !== '/modules/users/img/avatar.jpg') fs.unlink(process.cwd() + '/public/' + oldAvatar);
					return res.json({img: user.avatar});
				});
		}else{
				return res.status(400).send('Error with Stream. Image cannot be saved.');
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
