'use strict';

(function() {
	// Xtasklists Controller Spec
	describe('Xtasklists Controller Tests', function() {
		// Initialize global variables
		var XtasklistsController,
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

			// Initialize the Xtasklists controller.
			XtasklistsController = $controller('XtasklistsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Xtasklist object fetched from XHR', inject(function(Xtasklists) {
			// Create sample Xtasklist using the Xtasklists service
			var sampleXtasklist = new Xtasklists({
				name: 'New Xtasklist'
			});

			// Create a sample Xtasklists array that includes the new Xtasklist
			var sampleXtasklists = [sampleXtasklist];

			// Set GET response
			$httpBackend.expectGET('xtasklists').respond(sampleXtasklists);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.xtasklists).toEqualData(sampleXtasklists);
		}));

		it('$scope.findOne() should create an array with one Xtasklist object fetched from XHR using a xtasklistId URL parameter', inject(function(Xtasklists) {
			// Define a sample Xtasklist object
			var sampleXtasklist = new Xtasklists({
				name: 'New Xtasklist'
			});

			// Set the URL parameter
			$stateParams.xtasklistId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/xtasklists\/([0-9a-fA-F]{24})$/).respond(sampleXtasklist);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.xtasklist).toEqualData(sampleXtasklist);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Xtasklists) {
			// Create a sample Xtasklist object
			var sampleXtasklistPostData = new Xtasklists({
				name: 'New Xtasklist'
			});

			// Create a sample Xtasklist response
			var sampleXtasklistResponse = new Xtasklists({
				_id: '525cf20451979dea2c000001',
				name: 'New Xtasklist'
			});

			// Fixture mock form input values
			scope.name = 'New Xtasklist';

			// Set POST response
			$httpBackend.expectPOST('xtasklists', sampleXtasklistPostData).respond(sampleXtasklistResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Xtasklist was created
			expect($location.path()).toBe('/xtasklists/' + sampleXtasklistResponse._id);
		}));

		it('$scope.update() should update a valid Xtasklist', inject(function(Xtasklists) {
			// Define a sample Xtasklist put data
			var sampleXtasklistPutData = new Xtasklists({
				_id: '525cf20451979dea2c000001',
				name: 'New Xtasklist'
			});

			// Mock Xtasklist in scope
			scope.xtasklist = sampleXtasklistPutData;

			// Set PUT response
			$httpBackend.expectPUT(/xtasklists\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/xtasklists/' + sampleXtasklistPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid xtasklistId and remove the Xtasklist from the scope', inject(function(Xtasklists) {
			// Create new Xtasklist object
			var sampleXtasklist = new Xtasklists({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Xtasklists array and include the Xtasklist
			scope.xtasklists = [sampleXtasklist];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/xtasklists\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleXtasklist);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.xtasklists.length).toBe(0);
		}));
	});
}());