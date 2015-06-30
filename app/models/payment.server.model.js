'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Payment Schema
 */
var PaymentSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Payment name',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	amount: {
		type: Number,
		default: 0
	}
});

mongoose.model('Payment', PaymentSchema);
