'use strict';

// Wgs controller
angular.module('wgs').controller('WgsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Wgs',
	function($scope, $http, $stateParams, $location, Authentication, Wgs) {
		$scope.authentication = Authentication;

		// Create new Wg
		$scope.create = function() {
			// Create new Wg object
			var wg = new Wgs ({
				name: this.name,
				street: this.street,
				number: this.number,
				zip: this.zip,
				city: this.city,
				created_from: $scope.authentication.user.username
			});

			// Redirect after save
			wg.$save(function(response) {
				$location.path('wgs/' + response._id);
				$scope.wg = response;
				$scope.authentication.user.wg_id = response._id;

				// Clear form fields
				$scope.name = '';
				$scope.street = '';
				$scope.number = '';
				$scope.zip = '';
				$scope.city = '';
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
			var myObj = {
				userId: $scope.authentication.user._id,
				pass: this.pass
			};

			$http.post('/wgs/join', myObj).success(function(response) {
				// Show user success message and clear form
				$scope.authentication.user.wg_id = response._id;
				$location.path('wgs/' + response._id);

			}).error(function(response) {
				// Show user error message and clear form
				console.log(response);
				$scope.error = response.message;
			});
		};
	}
]);
