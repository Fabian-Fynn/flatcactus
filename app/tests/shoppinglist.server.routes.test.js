'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Shoppinglist = mongoose.model('Shoppinglist'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, shoppinglist;

/**
 * Shoppinglist routes tests
 */
describe('Shoppinglist CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Shoppinglist
		user.save(function() {
			shoppinglist = {
				name: 'Shoppinglist Name'
			};

			done();
		});
	});

	it('should be able to save Shoppinglist instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Shoppinglist
				agent.post('/shoppinglists')
					.send(shoppinglist)
					.expect(200)
					.end(function(shoppinglistSaveErr, shoppinglistSaveRes) {
						// Handle Shoppinglist save error
						if (shoppinglistSaveErr) done(shoppinglistSaveErr);

						// Get a list of Shoppinglists
						agent.get('/shoppinglists')
							.end(function(shoppinglistsGetErr, shoppinglistsGetRes) {
								// Handle Shoppinglist save error
								if (shoppinglistsGetErr) done(shoppinglistsGetErr);

								// Get Shoppinglists list
								var shoppinglists = shoppinglistsGetRes.body;

								// Set assertions
								(shoppinglists[0].user._id).should.equal(userId);
								(shoppinglists[0].name).should.match('Shoppinglist Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Shoppinglist instance if not logged in', function(done) {
		agent.post('/shoppinglists')
			.send(shoppinglist)
			.expect(401)
			.end(function(shoppinglistSaveErr, shoppinglistSaveRes) {
				// Call the assertion callback
				done(shoppinglistSaveErr);
			});
	});

	it('should not be able to save Shoppinglist instance if no name is provided', function(done) {
		// Invalidate name field
		shoppinglist.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Shoppinglist
				agent.post('/shoppinglists')
					.send(shoppinglist)
					.expect(400)
					.end(function(shoppinglistSaveErr, shoppinglistSaveRes) {
						// Set message assertion
						(shoppinglistSaveRes.body.message).should.match('Please fill Shoppinglist name');
						
						// Handle Shoppinglist save error
						done(shoppinglistSaveErr);
					});
			});
	});

	it('should be able to update Shoppinglist instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Shoppinglist
				agent.post('/shoppinglists')
					.send(shoppinglist)
					.expect(200)
					.end(function(shoppinglistSaveErr, shoppinglistSaveRes) {
						// Handle Shoppinglist save error
						if (shoppinglistSaveErr) done(shoppinglistSaveErr);

						// Update Shoppinglist name
						shoppinglist.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Shoppinglist
						agent.put('/shoppinglists/' + shoppinglistSaveRes.body._id)
							.send(shoppinglist)
							.expect(200)
							.end(function(shoppinglistUpdateErr, shoppinglistUpdateRes) {
								// Handle Shoppinglist update error
								if (shoppinglistUpdateErr) done(shoppinglistUpdateErr);

								// Set assertions
								(shoppinglistUpdateRes.body._id).should.equal(shoppinglistSaveRes.body._id);
								(shoppinglistUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Shoppinglists if not signed in', function(done) {
		// Create new Shoppinglist model instance
		var shoppinglistObj = new Shoppinglist(shoppinglist);

		// Save the Shoppinglist
		shoppinglistObj.save(function() {
			// Request Shoppinglists
			request(app).get('/shoppinglists')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Shoppinglist if not signed in', function(done) {
		// Create new Shoppinglist model instance
		var shoppinglistObj = new Shoppinglist(shoppinglist);

		// Save the Shoppinglist
		shoppinglistObj.save(function() {
			request(app).get('/shoppinglists/' + shoppinglistObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', shoppinglist.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Shoppinglist instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Shoppinglist
				agent.post('/shoppinglists')
					.send(shoppinglist)
					.expect(200)
					.end(function(shoppinglistSaveErr, shoppinglistSaveRes) {
						// Handle Shoppinglist save error
						if (shoppinglistSaveErr) done(shoppinglistSaveErr);

						// Delete existing Shoppinglist
						agent.delete('/shoppinglists/' + shoppinglistSaveRes.body._id)
							.send(shoppinglist)
							.expect(200)
							.end(function(shoppinglistDeleteErr, shoppinglistDeleteRes) {
								// Handle Shoppinglist error error
								if (shoppinglistDeleteErr) done(shoppinglistDeleteErr);

								// Set assertions
								(shoppinglistDeleteRes.body._id).should.equal(shoppinglistSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Shoppinglist instance if not signed in', function(done) {
		// Set Shoppinglist user 
		shoppinglist.user = user;

		// Create new Shoppinglist model instance
		var shoppinglistObj = new Shoppinglist(shoppinglist);

		// Save the Shoppinglist
		shoppinglistObj.save(function() {
			// Try deleting Shoppinglist
			request(app).delete('/shoppinglists/' + shoppinglistObj._id)
			.expect(401)
			.end(function(shoppinglistDeleteErr, shoppinglistDeleteRes) {
				// Set message assertion
				(shoppinglistDeleteRes.body.message).should.match('User is not logged in');

				// Handle Shoppinglist error error
				done(shoppinglistDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Shoppinglist.remove().exec();
		done();
	});
});