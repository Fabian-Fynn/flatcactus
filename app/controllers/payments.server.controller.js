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
	var payment = new Payment(req.body);
	payment.user = req.user;
	payment.wg_id = req.user.wg_id;

	if(Object.keys(payment.users).length === 0){
		return res.status(400).send({
			message: 'No user assigned to this task'
		});
	}



	//update users' balances
	payment.users.forEach(function(user){
		if (!user.creator) {
			User.updateBalanceById(user._id, -user.amount);
			sumAmount += user.amount;
		}
	});

	/*
		Creator gets amount that others owe him as plus
	*/
	req.user.updateBalance(sumAmount);

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
	var payment = req.payment ;
	var amountDifference = req.body.amount - req.payment.amount;
	var currentUser;

	//update users' balances
	for (var i = 0; i < payment.users.length; i++) {
		if(!payment.users[i].creator) {
			var diff = payment.users[i].amount - req.body.users[i].amount;
			User.updateBalanceById(
				payment.users[i]._id,
				diff);
			sumAmount += diff;
		} else {
			currentUser = payment.users[i];
		}
	}

	/*
		Creator gets amount that others owe him as plus
	*/
	User.updateBalanceById(
		currentUser._id,
		-sumAmount);

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

	//update users' balances
	payment.users.forEach(function(user){
		if (!user.creator) {
			User.updateBalanceById(user._id, user.amount);
			sumAmount += user.amount;
		}
	});

	req.user.updateBalance(-sumAmount);

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
