'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Xtasklist = mongoose.model('Xtasklist');

/**
 * Globals
 */
var user, xtasklist;

/**
 * Unit tests
 */
describe('Xtasklist Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() { 
			xtasklist = new Xtasklist({
				name: 'Xtasklist Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return xtasklist.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			xtasklist.name = '';

			return xtasklist.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Xtasklist.remove().exec();
		User.remove().exec();

		done();
	});
});