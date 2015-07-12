'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	crypto = require('crypto'),
	Wg = mongoose.model('Wg'),
	User = mongoose.model('User'),
	Shoppinglist = mongoose.model('Shoppinglist'),
	Payment = mongoose.model('Payment'),
	Xtasklist = mongoose.model('Xtasklist'),
	Todo = mongoose.model('Todo'),
	_ = require('lodash'),
	randomWord = require('random-word');


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

			Shoppinglist.remove({wg_id: mongoose.Types.ObjectId(wg._id)});
			Payment.remove({wg_id: mongoose.Types.ObjectId(wg._id)});
			Xtasklist.remove({wg_id: mongoose.Types.ObjectId(wg._id)});
			Todo.remove({wg_id: mongoose.Types.ObjectId(wg._id)});
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

	var newPass = randomWord() + "-" + randomWord();

	Xtasklist.find({wg_id: mongoose.Types.ObjectId(wg._id)}, function(err, tasks){
		var task = tasks;
		task.forEach(function(elem){
			if(elem.users.hasOwnProperty(req.user._id)){
				var turnUser = elem.users[req.user._id].turn;
				var isNext = elem.users[req.user._id].isNext;
				var isCurrent = (elem.crtUser.toString() == req.user._id.toString());

				var changeNext = false;
				var newNextTurn = 0;
				var crtIsNext = false;
				var usersNext = [];

				for(var user in elem.users){
					usersNext.push({id: elem.users[user]._id, turn: elem.users[user].turn});
					if(elem.users[user].turn > turnUser) elem.users[user].turn = Math.max(1, elem.users[user].turn-1);
					if(elem.users[user].turn == turnUser) elem.users[user].isNext = isNext;
					if((turnUser-1) === 1) crtIsNext = true;
					if(isCurrent && elem.users[user].isNext){
						newNextTurn = elem.users[user].turn+1;
						changeNext = true;
						elem.crtUser = elem.users[user]._id;
					}
				}
				if(changeNext || crtIsNext){
					usersNext.forEach(function(u){
						if(crtIsNext){
							elem.users[u.id].isNext = true;
						}
						if(changeNext && u.isNext === newNextTurn){
							elem.users[u.id].isNext = true;
						}
					});
				}
				console.log('delete KEY');
				delete elem.users[req.user._id];

				Xtasklist.update({ _id: elem._id },{ $set: { users: elem.users }}, function(err){
					if(err) console.log('error while update task');
					console.log('update task success');
				});
			}
		});

		Wg.update({ _id: wg._id },{ $set: { users: wg.users, passphrase: newPass }}, function(error,wg){
			console.log('update wg.users');
			if(error){ console.log('error'); }
		});
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
	if(req.user.balance !== 0) {
		return res.status(403).send('User is has debts/credit.');
	}
	next();
};

exports.loggon = function(req, res) {
	User.update({ _id: req.body.user._id }, { $set: { socket_id: req.body.socketID }}, function(error, user){
		if(error){ 
			return res.status(400).send({
				message: errorHandler.getErrorMessage(error)
			});
		}
	});
};
