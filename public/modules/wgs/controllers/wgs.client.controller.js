'use strict';

// Wgs controller
angular.module('wgs').controller('WgsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Wgs',
	function($scope, $stateParams, $location, Authentication, Wgs) {
		$scope.authentication = Authentication;

		// Create new Wg
		$scope.create = function() {
			// Create new Wg object
			var wg = new Wgs ({
				name: this.name,
				street: this.street,
				zip: this.zip,
				created_from: $scope.authentication.user.username
			});

			// wg.users.push($scope.authentication.user);
			// Redirect after save
			wg.$save(function(response) {
				$location.path('wgs/' + response._id);
				$scope.authentication.user.wg_id = response._id;

				// Clear form fields
				$scope.name = '';
				$scope.street = '';
				$scope.zip = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Wg
		$scope.remove = function(wg) {
			if ( wg ) {
				wg.$remove();

				for (var i in $scope.wgs) {
					if ($scope.wgs [i] === wg) {
						$scope.wgs.splice(i, 1);
					}
				}
			} else {
				$scope.wg.$remove(function() {
					$location.path('wgs');
				});
			}
		};

		// Update existing Wg
		$scope.update = function() {
			var wg = $scope.wg;

			wg.$update(function() {
				$location.path('wgs/' + wg._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Wgs
		$scope.find = function() {
			$scope.wgs = Wgs.query();
		};

		// Find existing Wg
		$scope.findOne = function() {
			$scope.wg = Wgs.get({
				wgId: $stateParams.wgId
			});
		};

		$scope.findPass = function(){
			var wg = $scope.wg;

			wg = Wgs.get({
			});
		};
	}
]);
