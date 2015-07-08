'use strict';

// Shoppinglists controller
angular.module('shoppinglists', ['ngSocketIO']).controller('ShoppinglistsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Shoppinglists', '$socket',
	function($scope, $http, $stateParams, $location, Authentication, Shoppinglists, $socket) {
		$scope.authentication = Authentication;
		// var socket = io.connect();
		// Create new Shoppinglist
		$scope.create = function() {
			// Create new Shoppinglist object
			var shoppinglist = new Shoppinglists ({
				name: this.name,
				created_by: $scope.authentication.user.displayName,
				wg_id: $scope.authentication.user.wg_id
			});

			// Redirect after save
			shoppinglist.$save(function(response) {
				$scope.shoppinglists.push(response);
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
			$scope.removeBgClass();
			$scope.shoppinglists = Shoppinglists.query();
		};

		// Find existing Shoppinglist
		$scope.findOne = function() {
			$scope.removeBgClass();
			$scope.shoppinglist = Shoppinglists.get({
				shoppinglistId: $stateParams.shoppinglistId
			});
		};

		$scope.getAll = function(){
			$http.get('/shoppinglist/all-from-share').success(function(res){
				$scope.shoppinglists = res;
			}).error(function(err){
				console.log('error at get', err);
				$scope.error = err.message;
			});
		};

		$scope.setToDone = function(index,shop){
				var path = '/shoppinglists/' + shop._id;
				var item = shop;

				item.isDone = (item.isDone) ? false : true;
				item.done_when = (item.isDone) ? new Date() : null;
				item.done_by = (item.isDone) ? $scope.authentication.user.displayName : '';
				$http.put(path, item).success(function(res){
					$scope.shoppinglists[index] = item;
				}).error(function(err){
					$scope.error = err.message;
				});
		};

		$scope.removeBgClass = function(){
			document.body.style.background = '#fff';
		};

		socket.on('shoppings.update', function (post) {
			$scope.getAll();
		});

	}
]);
