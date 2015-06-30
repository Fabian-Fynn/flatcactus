'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Payment = mongoose.model('Payment'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, payment;

/**
 * Payment routes tests
 */
describe('Payment CRUD tests', function() {
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

		// Save a user to the test db and create new Payment
		user.save(function() {
			payment = {
				name: 'Payment Name'
			};

			done();
		});
	});

	it('should be able to save Payment instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Payment
				agent.post('/payments')
					.send(payment)
					.expect(200)
					.end(function(paymentSaveErr, paymentSaveRes) {
						// Handle Payment save error
						if (paymentSaveErr) done(paymentSaveErr);

						// Get a list of Payments
						agent.get('/payments')
							.end(function(paymentsGetErr, paymentsGetRes) {
								// Handle Payment save error
								if (paymentsGetErr) done(paymentsGetErr);

								// Get Payments list
								var payments = paymentsGetRes.body;

								// Set assertions
								(payments[0].user._id).should.equal(userId);
								(payments[0].name).should.match('Payment Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Payment instance if not logged in', function(done) {
		agent.post('/payments')
			.send(payment)
			.expect(401)
			.end(function(paymentSaveErr, paymentSaveRes) {
				// Call the assertion callback
				done(paymentSaveErr);
			});
	});

	it('should not be able to save Payment instance if no name is provided', function(done) {
		// Invalidate name field
		payment.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Payment
				agent.post('/payments')
					.send(payment)
					.expect(400)
					.end(function(paymentSaveErr, paymentSaveRes) {
						// Set message assertion
						(paymentSaveRes.body.message).should.match('Please fill Payment name');
						
						// Handle Payment save error
						done(paymentSaveErr);
					});
			});
	});

	it('should be able to update Payment instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Payment
				agent.post('/payments')
					.send(payment)
					.expect(200)
					.end(function(paymentSaveErr, paymentSaveRes) {
						// Handle Payment save error
						if (paymentSaveErr) done(paymentSaveErr);

						// Update Payment name
						payment.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Payment
						agent.put('/payments/' + paymentSaveRes.body._id)
							.send(payment)
							.expect(200)
							.end(function(paymentUpdateErr, paymentUpdateRes) {
								// Handle Payment update error
								if (paymentUpdateErr) done(paymentUpdateErr);

								// Set assertions
								(paymentUpdateRes.body._id).should.equal(paymentSaveRes.body._id);
								(paymentUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Payments if not signed in', function(done) {
		// Create new Payment model instance
		var paymentObj = new Payment(payment);

		// Save the Payment
		paymentObj.save(function() {
			// Request Payments
			request(app).get('/payments')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Payment if not signed in', function(done) {
		// Create new Payment model instance
		var paymentObj = new Payment(payment);

		// Save the Payment
		paymentObj.save(function() {
			request(app).get('/payments/' + paymentObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', payment.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Payment instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Payment
				agent.post('/payments')
					.send(payment)
					.expect(200)
					.end(function(paymentSaveErr, paymentSaveRes) {
						// Handle Payment save error
						if (paymentSaveErr) done(paymentSaveErr);

						// Delete existing Payment
						agent.delete('/payments/' + paymentSaveRes.body._id)
							.send(payment)
							.expect(200)
							.end(function(paymentDeleteErr, paymentDeleteRes) {
								// Handle Payment error error
								if (paymentDeleteErr) done(paymentDeleteErr);

								// Set assertions
								(paymentDeleteRes.body._id).should.equal(paymentSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Payment instance if not signed in', function(done) {
		// Set Payment user 
		payment.user = user;

		// Create new Payment model instance
		var paymentObj = new Payment(payment);

		// Save the Payment
		paymentObj.save(function() {
			// Try deleting Payment
			request(app).delete('/payments/' + paymentObj._id)
			.expect(401)
			.end(function(paymentDeleteErr, paymentDeleteRes) {
				// Set message assertion
				(paymentDeleteRes.body.message).should.match('User is not logged in');

				// Handle Payment error error
				done(paymentDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Payment.remove().exec();
		done();
	});
});