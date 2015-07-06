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

			$http.get('/')
			$scope.todos = Todos.query();
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
				console.log('GOO');
				$scope.todos[index].isDone = true;
			}
		}

		$scope.removeBgClass = function(){
			document.body.style.background = '#fff';
		};
	}
]);
