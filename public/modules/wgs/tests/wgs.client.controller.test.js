'use strict';

(function() {
	// Wgs Controller Spec
	describe('Wgs Controller Tests', function() {
		// Initialize global variables
		var WgsController,
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

			// Initialize the Wgs controller.
			WgsController = $controller('WgsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Wg object fetched from XHR', inject(function(Wgs) {
			// Create sample Wg using the Wgs service
			var sampleWg = new Wgs({
				name: 'New Wg'
			});

			// Create a sample Wgs array that includes the new Wg
			var sampleWgs = [sampleWg];

			// Set GET response
			$httpBackend.expectGET('wgs').respond(sampleWgs);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.wgs).toEqualData(sampleWgs);
		}));

		it('$scope.findOne() should create an array with one Wg object fetched from XHR using a wgId URL parameter', inject(function(Wgs) {
			// Define a sample Wg object
			var sampleWg = new Wgs({
				name: 'New Wg'
			});

			// Set the URL parameter
			$stateParams.wgId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/wgs\/([0-9a-fA-F]{24})$/).respond(sampleWg);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.wg).toEqualData(sampleWg);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Wgs) {
			// Create a sample Wg object
			var sampleWgPostData = new Wgs({
				name: 'New Wg'
			});

			// Create a sample Wg response
			var sampleWgResponse = new Wgs({
				_id: '525cf20451979dea2c000001',
				name: 'New Wg'
			});

			// Fixture mock form input values
			scope.name = 'New Wg';

			// Set POST response
			$httpBackend.expectPOST('wgs', sampleWgPostData).respond(sampleWgResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Wg was created
			expect($location.path()).toBe('/wgs/' + sampleWgResponse._id);
		}));

		it('$scope.update() should update a valid Wg', inject(function(Wgs) {
			// Define a sample Wg put data
			var sampleWgPutData = new Wgs({
				_id: '525cf20451979dea2c000001',
				name: 'New Wg'
			});

			// Mock Wg in scope
			scope.wg = sampleWgPutData;

			// Set PUT response
			$httpBackend.expectPUT(/wgs\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/wgs/' + sampleWgPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid wgId and remove the Wg from the scope', inject(function(Wgs) {
			// Create new Wg object
			var sampleWg = new Wgs({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Wgs array and include the Wg
			scope.wgs = [sampleWg];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/wgs\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleWg);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.wgs.length).toBe(0);
		}));
	});
}());