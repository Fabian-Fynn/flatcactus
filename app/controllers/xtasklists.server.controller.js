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
	xtasklist.wg_id = req.user.wg_id;
	xtasklist.start = xtasklist.start.resetTime();
	xtasklist.origin = xtasklist.start;

	if(Object.keys(xtasklist.users).length === 0){
		return res.status(400).send({
			message: 'No user assigned to this task'
		});
	}

	var end;
	switch(xtasklist.interval){
		case 'daily':
			end = xtasklist.start.addDays(1);
			break;
		case 'weekly':
			end = xtasklist.start.addDays(7);
			break;
		case 'monthly':
			end = xtasklist.start.addMonths(1);
			break;
	}
	xtasklist.end = end;

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

// helpers for tasks
Date.prototype.resetTime = function(){
	var dat = new Date(this.valueOf());
	dat.setHours(0);
	dat.setMinutes(0);
	dat.setSeconds(0);
	return dat;
};

Date.prototype.addDays = function(days){
		var dat = new Date(this.valueOf());
		dat.setDate(dat.getDate() + days);
		return dat;
};

Date.prototype.addMonths = function(months){
	var dat = new Date(this.valueOf());
	dat.setMonth(dat.getMonth() + months);
	return dat;
};

/**
 * Show the current Xtasklist
 */
exports.read = function(req, res) {
	res.jsonp(req.xtasklist);
};

/*
 * get all from a specific share
 */
exports.getAllFromWg = function(req, res) {
	var wgID = req.wg._id;
	console.log('wgID', wgID);

	Xtasklist.find({wg_id: wgID}).populate('crtUser').exec(function(err, tasklists){
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(tasklists);
		}
	});
};

/*
 * check if the user is allowed
 * to read the requested task
 */
exports.checkIfAllowed = function(req, res, next) { 
	console.log('checkWG');
	if(req.wg){
		var wgFromUser = req.wg._id.toString();
		var userWg = req.user.wg_id.toString();
		console.log('wgFromUser != userWg', wgFromUser !== userWg);

		if(wgFromUser === userWg){
			next();
		}
	} else {
		console.log('do error');
		return res.status(403).send({
			stat: '403',
			message: 'You are not allowed to see this'
		});
	}

};
/**
 * Update a Xtasklist
 */
exports.update = function(req, res) {
	var xtasklist = req.xtasklist;

	xtasklist = _.extend(xtasklist , req.body);

	xtasklist.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			Xtasklist.findById(xtasklist._id).populate('crtUser').exec(function(err, task){
				res.jsonp(task);
			});
		}
	});
};

/*
 * UPDATE all tasks from a wg
 */

function updateTheTask(t){
	Xtasklist.update({_id: t._id}, {
		$set: {
			start: t.start,
			end: t.end,
			isDone: t.isDone,
			crtUser: t.crtUser,
			users: t.users,
			updated: t.updated
		}
	}, function(err,ta){
		if(err) console.log('ERROR');
		console.log('updated task');
	});
}

function getUpdatedUsers(t, dif, numUsers){
	var arr = [];
	var nextTurnNum;

	for(var user in t.users){
		var obj = {};
		obj.id = t.users[user]._id;
		obj.name = t.users[user].username;
		obj.turn = t.users[user].turn;
		if(t.users[user].isNext){
			if(dif > 1)
			{ nextTurnNum = (dif) % numUsers; } else { nextTurnNum = obj.turn-1; }

			t.users[user].isNext = false;
		}
		arr.push(obj);
	}

	arr.sort(function(a,b){ return a.turn - b.turn; });
	t.crtUser = arr[nextTurnNum].id; // neuer crtUser
	var newNextTurn = (nextTurnNum+1) % numUsers;
	var idOfNext = arr[newNextTurn].id;
	t.users[idOfNext].isNext = true;
	t.updated = new Date();

	return t;
}

function updateDaily(task){
	var t = task;
	var crt = new Date();
	if(crt > t.end){
		var difInMilSecs = crt - t.origin;
		var dif = getDayDifference(difInMilSecs); // dif in days from origin date start
		var numOfUsers = Object.keys(t.users).length;
		t.start = t.origin.addDays(dif);
		t.end = t.start.addDays(1);
		t.isDone = false;

		t = getUpdatedUsers(t, dif, numOfUsers);
		updateTheTask(t);
	}
}

function updateWeekly(task){
	var t = task;
	var crt = new Date();
	if(crt > t.end){
		var difInMilSecs = crt - t.origin;
		var dif = getDayDifference(difInMilSecs); // dif in days from origin date start
		var numOfUsers = Object.keys(t.users).length;
		var passedWeeksInDays = Math.floor(dif/7);
		t.start = t.origin.addDays(passedWeeksInDays);
		t.end = t.start.addDays(7);
		t.isDone = false;

		t = getUpdatedUsers(t, passedWeeksInDays, numOfUsers);
		updateTheTask(t);
	}
}

function updateMonthly(task){
	var t = task;
	var crt = new Date();
	if(crt > t.end){
		var difInMonths = monthDiff(t.origin, crt);
		var numOfUsers = Object.keys(t.users).length;
		t.start = t.origin.addMonths(difInMonths);
		t.end = t.start.addMonths(1);
		t.isDone = false;

		t = getUpdatedUsers(t, difInMonths, numOfUsers);
		updateTheTask(t);
	}
}

function getDayDifference(time){
	time /= 1000;
	var days = Math.floor(time / 86400);
	return days;
}

function monthDiff(d1, d2){
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}

exports.updateAllTasks = function(req){
	// Xtasklist.where({wg_id: req.user.wg_id}).exec(function(err, tasks){
	// 	tasks.forEach(function(elem){
	// 		if(elem.interval === 'daily') updateDaily(elem);
	// 		if(elem.interval === 'weekly') updateWeekly(elem);
	// 		if(elem.interval === 'monthly') updateMonthly(elem);
	// 	});
	// });
	//
	Xtasklist.where({wg_id: req.user.wg_id, interval: 'daily'}).exec(function(err, tasks){
		tasks.forEach(function(elem){
			updateDaily(elem);
		});
	});

	Xtasklist.where({wg_id: req.user.wg_id, interval: 'weekly'}).exec(function(err, tasks){
		tasks.forEach(function(elem){
			updateWeekly(elem);
		});
	});

	Xtasklist.where({wg_id: req.user.wg_id, interval: 'monthly'}).exec(function(err, tasks){
		tasks.forEach(function(elem){
			updateMonthly(elem);
		});
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
	Xtasklist.findById(id).populate('crtUser').exec(function(err, xtasklist) {
		if (err) return next(err);
		if (! xtasklist) return next(new Error('Failed to load task ' + id));
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
