'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Payment = mongoose.model('Payment'),
	User = mongoose.model('User'),
	_ = require('lodash');

/**
 * Create a Payment
 */
exports.create = function(req, res) {
	var sumAmount = 0;

	req.body.users.forEach(function(user){
		if (!user.amount) {
			user.amount = 0;
		}
	});

	var payment = new Payment(req.body);
	payment.user = req.user;
	payment.wg_id = req.user.wg_id;

	//sum other users' amounts
	payment.users.forEach(function(user){
		if (!user.creator) {
			sumAmount += user.amount;
		}
	});

	//Other users are affected by payment
	//In case a user creates a payment that only affects him/her
	//we don't want to give him/her credit for it
	if (sumAmount !== 0) {
		payment.users.forEach(function(user){
				User.updateBalanceById(user._id, -user.amount);
		});
	}

	payment.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(payment);
		}
	});
};

/**
 * Show the current Payment
 */
exports.read = function(req, res) {
	res.jsonp(req.payment);
};

/*
 * get all from a specific share
 */
exports.getAllFromWg = function(req, res) {
	var wgID = req.wg._id;
	console.log('wgID', wgID);

	Payment.where({wg_id: wgID}).sort('-created').exec(function(err, payments){
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(payments);
		}
	});

};

/**
 * Update a Payment
 */
exports.update = function(req, res) {
	var sumAmount = 0;
	var justCreator = true;
	var payment = req.payment; //old payment
	var amountDifference = req.body.amount - req.payment.amount;
	var currentUser;

	//update other users' balances
	for (var i = 0; i < payment.users.length; i++) {
		if(!payment.users[i].creator) {
			if (req.body.users[i].amount !== 0) {
				justCreator = false;
			}
			var diff = payment.users[i].amount - req.body.users[i].amount;
			User.updateBalanceById(
				payment.users[i]._id,
				diff);
			sumAmount += diff;
		} else {
			currentUser = payment.users[i];
		}
	}

	//if there are other users affected by this payment we want to
	//update the creators balance
	if (!justCreator) {
		User.updateBalanceById(
			currentUser._id,
			-sumAmount);
	} else {
		User.updateBalanceById(
			currentUser._id,
			currentUser.amount);
	}

	payment = _.extend(payment, req.body);

	payment.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(payment);
		}
	});
};

/**
 * Delete an Payment
 */
exports.delete = function(req, res) {
	var sumAmount = 0;
	var payment = req.payment ;

	//sum other users' balances
	payment.users.forEach(function(user){
		if (!user.creator) {
			sumAmount += user.amount;
		}
	});

	//are other users involved?
	if (sumAmount !== 0) {
		payment.users.forEach(function(user){
				User.updateBalanceById(user._id, user.amount);
		});
	}

	payment.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(payment);
		}
	});
};

/**
 * List of Payments
 */
exports.list = function(req, res) {
	Payment.find().sort('-created').populate('user', 'displayName').exec(function(err, payments) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(payments);
		}
	});
};

/**
 * Payment middleware
 */
exports.paymentByID = function(req, res, next, id) {
	Payment.findById(id).populate('user', 'displayName').exec(function(err, payment) {
		if (err) return next(err);
		if (! payment) return next(new Error('Failed to load Payment ' + id));
		req.payment = payment ;
		next();
	});
};

/**
 * Payment authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.payment.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
