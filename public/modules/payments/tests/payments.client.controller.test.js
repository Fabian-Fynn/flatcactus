'use strict';

(function() {
	// Payments Controller Spec
	describe('Payments Controller Tests', function() {
		// Initialize global variables
		var PaymentsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Payments controller.
			PaymentsController = $controller('PaymentsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Payment object fetched from XHR', inject(function(Payments) {
			// Create sample Payment using the Payments service
			var samplePayment = new Payments({
				name: 'New Payment'
			});

			// Create a sample Payments array that includes the new Payment
			var samplePayments = [samplePayment];

			// Set GET response
			$httpBackend.expectGET('payments').respond(samplePayments);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.payments).toEqualData(samplePayments);
		}));

		it('$scope.findOne() should create an array with one Payment object fetched from XHR using a paymentId URL parameter', inject(function(Payments) {
			// Define a sample Payment object
			var samplePayment = new Payments({
				name: 'New Payment'
			});

			// Set the URL parameter
			$stateParams.paymentId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/payments\/([0-9a-fA-F]{24})$/).respond(samplePayment);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.payment).toEqualData(samplePayment);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Payments) {
			// Create a sample Payment object
			var samplePaymentPostData = new Payments({
				name: 'New Payment'
			});

			// Create a sample Payment response
			var samplePaymentResponse = new Payments({
				_id: '525cf20451979dea2c000001',
				name: 'New Payment'
			});

			// Fixture mock form input values
			scope.name = 'New Payment';

			// Set POST response
			$httpBackend.expectPOST('payments', samplePaymentPostData).respond(samplePaymentResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Payment was created
			expect($location.path()).toBe('/payments/' + samplePaymentResponse._id);
		}));

		it('$scope.update() should update a valid Payment', inject(function(Payments) {
			// Define a sample Payment put data
			var samplePaymentPutData = new Payments({
				_id: '525cf20451979dea2c000001',
				name: 'New Payment'
			});

			// Mock Payment in scope
			scope.payment = samplePaymentPutData;

			// Set PUT response
			$httpBackend.expectPUT(/payments\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/payments/' + samplePaymentPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid paymentId and remove the Payment from the scope', inject(function(Payments) {
			// Create new Payment object
			var samplePayment = new Payments({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Payments array and include the Payment
			scope.payments = [samplePayment];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/payments\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(samplePayment);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.payments.length).toBe(0);
		}));
	});
}());