'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Xtasklist = mongoose.model('Xtasklist'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, xtasklist;

/**
 * Xtasklist routes tests
 */
describe('Xtasklist CRUD tests', function() {
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

		// Save a user to the test db and create new Xtasklist
		user.save(function() {
			xtasklist = {
				name: 'Xtasklist Name'
			};

			done();
		});
	});

	it('should be able to save Xtasklist instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Xtasklist
				agent.post('/xtasklists')
					.send(xtasklist)
					.expect(200)
					.end(function(xtasklistSaveErr, xtasklistSaveRes) {
						// Handle Xtasklist save error
						if (xtasklistSaveErr) done(xtasklistSaveErr);

						// Get a list of Xtasklists
						agent.get('/xtasklists')
							.end(function(xtasklistsGetErr, xtasklistsGetRes) {
								// Handle Xtasklist save error
								if (xtasklistsGetErr) done(xtasklistsGetErr);

								// Get Xtasklists list
								var xtasklists = xtasklistsGetRes.body;

								// Set assertions
								(xtasklists[0].user._id).should.equal(userId);
								(xtasklists[0].name).should.match('Xtasklist Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Xtasklist instance if not logged in', function(done) {
		agent.post('/xtasklists')
			.send(xtasklist)
			.expect(401)
			.end(function(xtasklistSaveErr, xtasklistSaveRes) {
				// Call the assertion callback
				done(xtasklistSaveErr);
			});
	});

	it('should not be able to save Xtasklist instance if no name is provided', function(done) {
		// Invalidate name field
		xtasklist.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Xtasklist
				agent.post('/xtasklists')
					.send(xtasklist)
					.expect(400)
					.end(function(xtasklistSaveErr, xtasklistSaveRes) {
						// Set message assertion
						(xtasklistSaveRes.body.message).should.match('Please fill Xtasklist name');
						
						// Handle Xtasklist save error
						done(xtasklistSaveErr);
					});
			});
	});

	it('should be able to update Xtasklist instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Xtasklist
				agent.post('/xtasklists')
					.send(xtasklist)
					.expect(200)
					.end(function(xtasklistSaveErr, xtasklistSaveRes) {
						// Handle Xtasklist save error
						if (xtasklistSaveErr) done(xtasklistSaveErr);

						// Update Xtasklist name
						xtasklist.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Xtasklist
						agent.put('/xtasklists/' + xtasklistSaveRes.body._id)
							.send(xtasklist)
							.expect(200)
							.end(function(xtasklistUpdateErr, xtasklistUpdateRes) {
								// Handle Xtasklist update error
								if (xtasklistUpdateErr) done(xtasklistUpdateErr);

								// Set assertions
								(xtasklistUpdateRes.body._id).should.equal(xtasklistSaveRes.body._id);
								(xtasklistUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Xtasklists if not signed in', function(done) {
		// Create new Xtasklist model instance
		var xtasklistObj = new Xtasklist(xtasklist);

		// Save the Xtasklist
		xtasklistObj.save(function() {
			// Request Xtasklists
			request(app).get('/xtasklists')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Xtasklist if not signed in', function(done) {
		// Create new Xtasklist model instance
		var xtasklistObj = new Xtasklist(xtasklist);

		// Save the Xtasklist
		xtasklistObj.save(function() {
			request(app).get('/xtasklists/' + xtasklistObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', xtasklist.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Xtasklist instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Xtasklist
				agent.post('/xtasklists')
					.send(xtasklist)
					.expect(200)
					.end(function(xtasklistSaveErr, xtasklistSaveRes) {
						// Handle Xtasklist save error
						if (xtasklistSaveErr) done(xtasklistSaveErr);

						// Delete existing Xtasklist
						agent.delete('/xtasklists/' + xtasklistSaveRes.body._id)
							.send(xtasklist)
							.expect(200)
							.end(function(xtasklistDeleteErr, xtasklistDeleteRes) {
								// Handle Xtasklist error error
								if (xtasklistDeleteErr) done(xtasklistDeleteErr);

								// Set assertions
								(xtasklistDeleteRes.body._id).should.equal(xtasklistSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Xtasklist instance if not signed in', function(done) {
		// Set Xtasklist user 
		xtasklist.user = user;

		// Create new Xtasklist model instance
		var xtasklistObj = new Xtasklist(xtasklist);

		// Save the Xtasklist
		xtasklistObj.save(function() {
			// Try deleting Xtasklist
			request(app).delete('/xtasklists/' + xtasklistObj._id)
			.expect(401)
			.end(function(xtasklistDeleteErr, xtasklistDeleteRes) {
				// Set message assertion
				(xtasklistDeleteRes.body.message).should.match('User is not logged in');

				// Handle Xtasklist error error
				done(xtasklistDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Xtasklist.remove().exec();
		done();
	});
});