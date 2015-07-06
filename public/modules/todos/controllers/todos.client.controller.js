'use strict';

// Todos controller
angular.module('todos').controller('TodosController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Todos',
	function($scope, $http, $stateParams, $location, Authentication, Todos) {
		$scope.authentication = Authentication;

		// Create new Todo
		$scope.create = function() {
			// Create new Todo object
			var todo = new Todos ({
				name: this.name,
				created_by: $scope.authentication.user.displayName,
				wg_id: $scope.authentication.user.wg_id
			});

			// Redirect after save
			todo.$save(function(response) {
				$location.path('todos');

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Todo
		$scope.remove = function(todo) {
			if ( todo ) {
				todo.$remove();

				for (var i in $scope.todos) {
					if ($scope.todos [i] === todo) {
						$scope.todos.splice(i, 1);
					}
				}
			} else {
				$scope.todo.$remove(function() {
					$location.path('todos');
				});
			}
		};

		// Update existing Todo
		$scope.update = function() {
			var todo = $scope.todo;

			todo.$update(function() {
				$location.path('todos/' + todo._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Todos
		$scope.find = function() {
			$scope.removeBgClass();
			$scope.todos = Todos.query();
		};

		$scope.getAll = function(){
			$scope.removeBgClass();
			$http.get('/todo/all-from-share').success(function(res){
				$scope.todos = res;
			}).error(function(err){
				console.log('error at get', err);
				$scope.error = err.message;
			});
		};

		// Find existing Todo
		$scope.findOne = function() {
			$scope.removeBgClass();
			$scope.todo = Todos.get({
				todoId: $stateParams.todoId
			});
		};

		$scope.setToDone = function(index,todo){
			console.log('settoDone');
			if(!$scope.todos[index].isDone){
				var path = '/todos/' + todo._id;
				var item = todo;
				item.isDone = true;
				item.done_when = new Date();
				item.done_by = $scope.authentication.user.displayName;
				$http.put(path, item).success(function(res){
					$scope.todos[index] = item;
				}).error(function(err){
					$scope.error = err.message;
				})

			}
		};

		$scope.removeBgClass = function(){
			document.body.style.background = '#fff';
		};
	}
]);
