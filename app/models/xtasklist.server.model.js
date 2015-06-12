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
		default: Date.now
	},
	interval: {
		type: String,
		required: 'Please set an interval'
	},
	isDone: {
		type: Boolean,
		default: false
	},
	users: [{
		type: Object
	}],
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Xtasklist', XtasklistSchema);
