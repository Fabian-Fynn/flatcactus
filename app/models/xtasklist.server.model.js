'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Xtasklist Schema
 */
var XtasklistSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill tasklist name',
		trim: true
	},
	start: {
		type: Date,
		required: 'Please set a start date',
		default: Date.now
	},
	end: {
		type: Date
	},
	interval: {
		type: String,
		required: 'Please set an interval'
	},
	isDone: {
		type: Boolean,
		default: false
	},
	crtUser: {
		type: String
	},
	wg_id: {
		type: Schema.ObjectId,
		ref: 'Wg'
	},
	users: {
		type: Object,
		required: 'No user is assigned'
	},
	updated: {
		type: Date,
		default: Date.now
	},
	created: {
		type: Date,
		default: Date.now
	}
});

XtasklistSchema.pre('save', function(next) {
	this.updated = Date.now;
	next();
});

mongoose.model('Xtasklist', XtasklistSchema);
