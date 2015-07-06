'use strict';

(function() {
	// Shoppinglists Controller Spec
	describe('Shoppinglists Controller Tests', function() {
		// Initialize global variables
		var ShoppinglistsController,
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

			// Initialize the Shoppinglists controller.
			ShoppinglistsController = $controller('ShoppinglistsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Shoppinglist object fetched from XHR', inject(function(Shoppinglists) {
			// Create sample Shoppinglist using the Shoppinglists service
			var sampleShoppinglist = new Shoppinglists({
				name: 'New Shoppinglist'
			});

			// Create a sample Shoppinglists array that includes the new Shoppinglist
			var sampleShoppinglists = [sampleShoppinglist];

			// Set GET response
			$httpBackend.expectGET('shoppinglists').respond(sampleShoppinglists);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.shoppinglists).toEqualData(sampleShoppinglists);
		}));

		it('$scope.findOne() should create an array with one Shoppinglist object fetched from XHR using a shoppinglistId URL parameter', inject(function(Shoppinglists) {
			// Define a sample Shoppinglist object
			var sampleShoppinglist = new Shoppinglists({
				name: 'New Shoppinglist'
			});

			// Set the URL parameter
			$stateParams.shoppinglistId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/shoppinglists\/([0-9a-fA-F]{24})$/).respond(sampleShoppinglist);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.shoppinglist).toEqualData(sampleShoppinglist);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Shoppinglists) {
			// Create a sample Shoppinglist object
			var sampleShoppinglistPostData = new Shoppinglists({
				name: 'New Shoppinglist'
			});

			// Create a sample Shoppinglist response
			var sampleShoppinglistResponse = new Shoppinglists({
				_id: '525cf20451979dea2c000001',
				name: 'New Shoppinglist'
			});

			// Fixture mock form input values
			scope.name = 'New Shoppinglist';

			// Set POST response
			$httpBackend.expectPOST('shoppinglists', sampleShoppinglistPostData).respond(sampleShoppinglistResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Shoppinglist was created
			expect($location.path()).toBe('/shoppinglists/' + sampleShoppinglistResponse._id);
		}));

		it('$scope.update() should update a valid Shoppinglist', inject(function(Shoppinglists) {
			// Define a sample Shoppinglist put data
			var sampleShoppinglistPutData = new Shoppinglists({
				_id: '525cf20451979dea2c000001',
				name: 'New Shoppinglist'
			});

			// Mock Shoppinglist in scope
			scope.shoppinglist = sampleShoppinglistPutData;

			// Set PUT response
			$httpBackend.expectPUT(/shoppinglists\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/shoppinglists/' + sampleShoppinglistPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid shoppinglistId and remove the Shoppinglist from the scope', inject(function(Shoppinglists) {
			// Create new Shoppinglist object
			var sampleShoppinglist = new Shoppinglists({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Shoppinglists array and include the Shoppinglist
			scope.shoppinglists = [sampleShoppinglist];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/shoppinglists\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleShoppinglist);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.shoppinglists.length).toBe(0);
		}));
	});
}());