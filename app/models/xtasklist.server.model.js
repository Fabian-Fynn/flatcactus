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
		required: 'Please fill Xtasklist name',
		trim: true
	},
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