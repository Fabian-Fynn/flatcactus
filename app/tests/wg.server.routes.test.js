'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Wg = mongoose.model('Wg'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, wg;

/**
 * Wg routes tests
 */
describe('Wg CRUD tests', function() {
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

		// Save a user to the test db and create new Wg
		user.save(function() {
			wg = {
				name: 'Wg Name'
			};

			done();
		});
	});

	it('should be able to save Wg instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Wg
				agent.post('/wgs')
					.send(wg)
					.expect(200)
					.end(function(wgSaveErr, wgSaveRes) {
						// Handle Wg save error
						if (wgSaveErr) done(wgSaveErr);

						// Get a list of Wgs
						agent.get('/wgs')
							.end(function(wgsGetErr, wgsGetRes) {
								// Handle Wg save error
								if (wgsGetErr) done(wgsGetErr);

								// Get Wgs list
								var wgs = wgsGetRes.body;

								// Set assertions
								(wgs[0].user._id).should.equal(userId);
								(wgs[0].name).should.match('Wg Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Wg instance if not logged in', function(done) {
		agent.post('/wgs')
			.send(wg)
			.expect(401)
			.end(function(wgSaveErr, wgSaveRes) {
				// Call the assertion callback
				done(wgSaveErr);
			});
	});

	it('should not be able to save Wg instance if no name is provided', function(done) {
		// Invalidate name field
		wg.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Wg
				agent.post('/wgs')
					.send(wg)
					.expect(400)
					.end(function(wgSaveErr, wgSaveRes) {
						// Set message assertion
						(wgSaveRes.body.message).should.match('Please fill Wg name');
						
						// Handle Wg save error
						done(wgSaveErr);
					});
			});
	});

	it('should be able to update Wg instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Wg
				agent.post('/wgs')
					.send(wg)
					.expect(200)
					.end(function(wgSaveErr, wgSaveRes) {
						// Handle Wg save error
						if (wgSaveErr) done(wgSaveErr);

						// Update Wg name
						wg.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Wg
						agent.put('/wgs/' + wgSaveRes.body._id)
							.send(wg)
							.expect(200)
							.end(function(wgUpdateErr, wgUpdateRes) {
								// Handle Wg update error
								if (wgUpdateErr) done(wgUpdateErr);

								// Set assertions
								(wgUpdateRes.body._id).should.equal(wgSaveRes.body._id);
								(wgUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Wgs if not signed in', function(done) {
		// Create new Wg model instance
		var wgObj = new Wg(wg);

		// Save the Wg
		wgObj.save(function() {
			// Request Wgs
			request(app).get('/wgs')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Wg if not signed in', function(done) {
		// Create new Wg model instance
		var wgObj = new Wg(wg);

		// Save the Wg
		wgObj.save(function() {
			request(app).get('/wgs/' + wgObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', wg.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Wg instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Wg
				agent.post('/wgs')
					.send(wg)
					.expect(200)
					.end(function(wgSaveErr, wgSaveRes) {
						// Handle Wg save error
						if (wgSaveErr) done(wgSaveErr);

						// Delete existing Wg
						agent.delete('/wgs/' + wgSaveRes.body._id)
							.send(wg)
							.expect(200)
							.end(function(wgDeleteErr, wgDeleteRes) {
								// Handle Wg error error
								if (wgDeleteErr) done(wgDeleteErr);

								// Set assertions
								(wgDeleteRes.body._id).should.equal(wgSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Wg instance if not signed in', function(done) {
		// Set Wg user 
		wg.user = user;

		// Create new Wg model instance
		var wgObj = new Wg(wg);

		// Save the Wg
		wgObj.save(function() {
			// Try deleting Wg
			request(app).delete('/wgs/' + wgObj._id)
			.expect(401)
			.end(function(wgDeleteErr, wgDeleteRes) {
				// Set message assertion
				(wgDeleteRes.body.message).should.match('User is not logged in');

				// Handle Wg error error
				done(wgDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Wg.remove().exec();
		done();
	});
});