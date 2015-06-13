'use strict';

// Wgs controller
angular.module('wgs').controller('WgsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Flat', 'Wgs',
	function($scope, $http, $stateParams, $location, Authentication, Flat, Wgs) {
		$scope.authentication = Authentication;
		$scope.flat = Flat;

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
				$scope.authentication.user.wg_id = response._id;
				$scope.flat.wg = Flat.wg = wg;

				// Clear form fields
				$scope.name = '';
				$scope.street = '';
				$scope.number = '';
				$scope.zip = '';
				$scope.city = '';

				$location.path('wgs/' + response._id); // redirect
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

		$scope.leave = function() {
			var wg = $scope.wg;

			if(wg.users.length <= 1){
				wg.$remove();
			} else {
				var arr = wg.users;
				var index = arr.indexOf($scope.authentication.user._id);
				arr.splice(index, 1);
				wg.users = arr;

				$http.put('/my-share/leave', wg).success(function(response) {
					// Show user success message and clear form
					$scope.flat.wg = Flat.wg = response;
				}).error(function(response) {
					// Show user error message and clear form
					$scope.error = response.message;
				});
			}
			$scope.authentication.user.wg_id = null;
			$location.path('/');
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

		//Find existing Wg by user
		$scope.findByUser = function(user) {
			$scope.wg = Wgs.get({
				wgId: user.wg_id
			});
		};

		$scope.getWg = function() {
			$scope.wg = Wgs.get({
				wgId: $scope.authentication.user.wg_id
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
				$scope.flat.wg = Flat.wg = response;
				$location.path('wgs/' + response._id);

			}).error(function(response) {
				// Show user error message and clear form
				$scope.error = response.message;
			});
		};
	}
]);
