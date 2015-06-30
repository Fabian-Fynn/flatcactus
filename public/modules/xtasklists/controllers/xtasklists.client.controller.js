'use strict';

// Xtasklists controller
angular.module('xtasklists').controller('XtasklistsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Xtasklists', 'Wgs', 'Users', 'Flat',
	function($scope, $http, $stateParams, $location, Authentication, Xtasklists, wgs, users, Flat) {
		$scope.authentication = Authentication;

		// Create new Xtasklist
		$scope.create = function() {
			// Create new Xtasklist object
			var obj = {};
			var counter = 2;
			console.log('first', $scope);
			$scope.allUsers.forEach(function(user){
				if(user.checked){
					obj[user._id] = {};
					obj[user._id].howOften = 0;
					obj[user._id].crt = (user.username === $scope.first.name) ? true : false;
					obj[user._id].turn = (user.username === $scope.first.name) ? 1 : counter++;
					obj[user._id].isNext = (obj[user._id].turn !== 2) ? false : true;
				}
			});

			var xtasklist = new Xtasklists ({
				name: this.name,
				start: this.start,
				interval: this.interval,
				isDone: false,
				users: obj
			});

			// Redirect after save
			xtasklist.$save(function(response) {
				$location.path('xtasklists/' + response._id);

				// Clear form fields
				$scope.name = '';
				$scope.start = '';
				$scope.interval = 'weekly';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Xtasklist
		$scope.remove = function(xtasklist) {
			if ( xtasklist ) {
				xtasklist.$remove();

				for (var i in $scope.xtasklists) {
					if ($scope.xtasklists [i] === xtasklist) {
						$scope.xtasklists.splice(i, 1);
					}
				}
			} else {
				$scope.xtasklist.$remove(function() {
					$location.path('xtasklists');
				});
			}
		};

		// Update existing Xtasklist
		$scope.update = function() {
			var xtasklist = $scope.xtasklist;

			xtasklist.$update(function() {
				$location.path('xtasklists/' + xtasklist._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Xtasklists
		$scope.find = function() {
			$scope.xtasklists = Xtasklists.query();
		};

		// Find existing Xtasklist
		$scope.findOne = function() {
			$scope.xtasklist = Xtasklists.get({
				xtasklistId: $stateParams.xtasklistId
			});
		};

		$scope.checkfirst = function() {
			var count = 0;
			$scope.allUsers.forEach(function(user){
				if(user.checked) count++;
			});
			if(count === 0){ $scope.first.name = null; }
		};

		$scope.getUsers = function() {
			console.log('getUsers');
			$scope.interval = 'weekly';
			$http.get('/my-share/allusers').success(function(res) {
				$scope.allUsers = res;
				$scope.first = { name: null };

				$scope.allUsers.forEach(function(user){
					user.checked = false;
					user.first = false;
				});

			}).error(function(err){
				$scope.error = err.data.message;
			});
		};
	}
]);
