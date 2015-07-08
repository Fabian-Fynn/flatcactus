'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	crypto = require('crypto'),
	Schema = mongoose.Schema;

/**
 * Wg Schema
 */
var WgSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please name your living community',
		trim: true
	},
	street: {
		type: String,
		default: '',
		required: 'Please enter the street',
		trim: true
	},
	number: {
		type: String,
		default: '',
		required: 'Please enter a house number',
		trim: true
	},
	zip: {
		type: String,
		default: '',
		required: 'Pleas enter the ZIP code',
		trim: true
	},
	city: {
		type: String,
		default: '',
		required: 'Please enter the city',
		trim: true
	},
	country: {
		type: String,
		default: '',
		required: 'Please enter the country',
		trim: true
	},
	passphrase: {
		type: String
	},
	created_from: {
		type: 'String'
	},
	users: [{
		type: Schema.ObjectId,
		ref: 'User'
	}],
	tasklists: [{
			type: Schema.ObjectId,
			ref: 'Xtasklist'
	}],
	updated: {
		type: Date,
		default: Date.now
	},
	created: {
		type: Date,
		default: Date.now
	}
});

WgSchema.pre('save', function(next) {
	this.passphrase = crypto.randomBytes(16).toString('base64');
	next();
});

WgSchema.statics.notifyUsers = function(socketio, wgID, msg) {
	this.findById(wgID).populate('users').exec(function(err, wg){
		wg.users.forEach(function(user){
			if(user.socket_id) {
				socketio.to(user.socket_id).emit(msg);
			}
		});
	});

};

mongoose.model('Wg', WgSchema);
