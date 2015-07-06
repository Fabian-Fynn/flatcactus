'use strict';

// Shoppinglists controller
angular.module('shoppinglists').controller('ShoppinglistsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Shoppinglists',
	function($scope, $stateParams, $location, Authentication, Shoppinglists) {
		$scope.authentication = Authentication;

		// Create new Shoppinglist
		$scope.create = function() {
			// Create new Shoppinglist object
			var shoppinglist = new Shoppinglists ({
				name: this.name
			});

			// Redirect after save
			shoppinglist.$save(function(response) {
				$location.path('shoppinglists/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Shoppinglist
		$scope.remove = function(shoppinglist) {
			if ( shoppinglist ) { 
				shoppinglist.$remove();

				for (var i in $scope.shoppinglists) {
					if ($scope.shoppinglists [i] === shoppinglist) {
						$scope.shoppinglists.splice(i, 1);
					}
				}
			} else {
				$scope.shoppinglist.$remove(function() {
					$location.path('shoppinglists');
				});
			}
		};

		// Update existing Shoppinglist
		$scope.update = function() {
			var shoppinglist = $scope.shoppinglist;

			shoppinglist.$update(function() {
				$location.path('shoppinglists/' + shoppinglist._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Shoppinglists
		$scope.find = function() {
			$scope.shoppinglists = Shoppinglists.query();
		};

		// Find existing Shoppinglist
		$scope.findOne = function() {
			$scope.shoppinglist = Shoppinglists.get({ 
				shoppinglistId: $stateParams.shoppinglistId
			});
		};
	}
]);