'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Todo Schema
 */
var TodoSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill todo name',
		trim: true
	},
	created_by: {
		type: String
	},
	created: {
		type: Date,
		default: Date.now
	},
	isDone: {
		type: Boolean,
		default: false
	},
	done_by: {
		type: String,
		default: ''
	},
	done_when: {
		type: Date,
		default: null
	},
	wg_id: {
		type: Schema.ObjectId,
		ref: 'Wg'
	}
});

mongoose.model('Todo', TodoSchema);
