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
		default: 'weekly',
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
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Xtasklist', XtasklistSchema);
