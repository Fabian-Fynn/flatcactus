'use strict';

// Wgs controller
angular.module('wgs').controller('WgsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Flat', 'Wgs', 'Users', '$timeout',
	function($scope, $http, $stateParams, $location, Authentication, Flat, Wgs, Users, $timeout, jQuery) {
		$scope.authentication = Authentication;
		var timeout;

		// Create new Wg
		$scope.create = function() {
			// Create new Wg object
			var wg = new Wgs ({
				name: this.name,
				street: this.street,
				number: this.number,
				zip: this.zip,
				city: this.city,
				country: this.country,
				created_from: $scope.authentication.user.displayName
			});

			// Redirect after save
			wg.$save(function(response) {
				$scope.authentication.user.wg_id = response._id;

				// Clear form fields
				$scope.name = '';
				$scope.street = '';
				$scope.number = '';
				$scope.zip = '';
				$scope.city = '';
				$scope.country = '';

				$location.path('/'); // redirect
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
				console.log('delete wg', wg);
				$scope.authentication.user.wg_id = Authentication.user.wg_id = null;
				wg.$remove();
				$location.path('/');
			} else {
				console.log('update wg');
				var arr = wg.users;
				var index = arr.indexOf($scope.authentication.user._id);
				arr.splice(index, 1);
				wg.users = arr;

				$http.put('/my-share/leave', wg).success(function(response) {
					// Show user success message and clear form
					$scope.authentication.user.wg_id = Authentication.user.wg_id = null;
					console.log($scope.authentication.user.wg_id, Authentication.user.wg_id);
					$location.path('/');
				}).error(function(response) {
					// Show user error message and clear form
					console.log('ERROR')
					$scope.error = response;
				});
			}
		};

		// Update existing Wg
		$scope.update = function() {
			var wg = $scope.wg;

			wg.$update(function() {
				$scope.success = true;
				// $location.path('/');
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Wgs
		$scope.find = function() {
			$scope.removeBgClass();
			$scope.wgs = Wgs.query();
		};

		// Find existing Wg
		$scope.findOne = function() {
			$scope.removeBgClass();
			$scope.wg = Wgs.get({
				wgId: $scope.authentication.user.wg_id
			});
		};

		//Find existing Wg by user
		$scope.findByUser = function(user) {
			$scope.wg = Wgs.get({
				wgId: user.wg_id
			});
		};

		$scope.getWg = function() {
			$scope.removeBgClass();
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
				$location.path('/');

			}).error(function(response) {
				// Show user error message and clear form
				$scope.error = response.message;
			});
		};

		$scope.getUsers = function() {
			console.log('getUsers', $scope.authentication.user);

			if($scope.authentication.user.wg_id){
				$http.get('/my-share/allusers').success(function(res) {
					$scope.allUsers = res;
					console.log('res', res);
				}).error(function(err){
					console.log('err', err);
					$scope.error = err.data.message;
				});
			}
		};

		$scope.editMotd = function(user) {
			$timeout.cancel(timeout); //cancel the last timeout
    	timeout = $timeout(function(){

				$scope.allUsers.forEach(function(user){
					if ($scope.authentication.user._id === user._id) {
						$http.put('users/motd/', user);
					}
				});

				$scope.motdStatus = 'saved.';
				$('.notice').fadeIn('slow');
				setTimeout(function(){
					$('.notice').fadeOut('slow');
				}, 800);
    	}, 500);

		};

		$scope.removeBgClass = function(){
			document.body.style.background = '#fff';
		};
	}
]);
