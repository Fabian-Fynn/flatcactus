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
	var user = req.body.crtUser;
	req.body.crtUser = req.user._id;

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
function updateDaily(task){
	var crt = new Date();
	if(crt.getDate() !== task.start.getDate() && crt.getMonth() !== task.start.getMonth()){
		var difInMilSecs = crt.getTime() - task.start.getTime();
		var dif = Math.floor(difInMilSecs);

	}
}

function updateWeekly(task){
	var crt = new Date();
}

function updateMonthly(task){
	var crt = new Date();

}

function getDayDifference(time){
	time /= 1000;
	var days = Math.floor(time / 86400);
	return days;
}

exports.updateAllTasks = function(){
	Xtasklist.where({wg_id: req.user.wg_id}).exec(function(err, tasks){
		tasks.forEach(function(elem){
			if(elem.interval === 'daily') updateDaily(elem);
			if(elem.interval === 'weekly') updateWeekly(elem);
			if(elem.interval === 'monthly') updateMonthly(elem);
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
