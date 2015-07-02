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

mongoose.model('Xtasklist', XtasklistSchema);
