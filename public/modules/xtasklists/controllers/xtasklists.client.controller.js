'use strict';

// Xtasklists controller
angular.module('xtasklists').controller('XtasklistsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Xtasklists', 'Wgs', 'Users',
	function($scope, $http, $stateParams, $location, Authentication, Xtasklists, wgs, users) {
		$scope.authentication = Authentication;

		// Create new Xtasklist
		$scope.create = function() {
			// Create new Xtasklist object
			var xtasklist = new Xtasklists ({
				name: this.name
			});

			// Redirect after save
			xtasklist.$save(function(response) {
				$location.path('xtasklists/' + response._id);

				// Clear form fields
				$scope.name = '';
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

		$scope.getUsers = function() {
			var usersInWg = wgs.get({
				wgId: $scope.authentication.user.wg_id
			});

			var a = wgs.query({
				wgId: $scope.authentication.user.wg_id
			});

			var c = $http.get('/my-share').success(function(response) {
				console.log('lalal');
			});

			console.log('c', c);

			console.log('usersInWg', usersInWg);
			console.log('lala', usersInWg);

			$scope.arr = [];
			for(var i = 0; i < usersInWg.users.length; i++) {
				users.query( {userId: usersInWg[i]._id }, function(){
					console.log('heheh');
				})
				users.get({ userId: usersInWg[i]._id }, function(){
					console.log('lalal');
				});
				console.log('lele');
			}


		}
	}
]);
