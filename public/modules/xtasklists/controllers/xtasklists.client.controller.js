'use strict';

// Xtasklists controller
angular.module('xtasklists').controller('XtasklistsController', ['$rootScope', '$scope', '$http', '$stateParams', '$location', 'Authentication', 'Xtasklists', 'Wgs', 'Users', 'Flat',
	function($rootScope, $scope, $http, $stateParams, $location, Authentication, Xtasklists, wgs, users, Flat) {
		$scope.authentication = Authentication;
		$scope.xtasklist = null;
		// $scope.findFromWg();

		// Create new Xtasklist
		$scope.create = function() {
			// Create new Xtasklist object
			var obj = fillUserObject();
			console.log('create task');

			var xtasklist = new Xtasklists ({
				name: this.name,
				start: this.start,
				interval: this.interval,
				isDone: false,
				users: obj,
				crtUser: $scope.first.name
			});

			// Redirect after save
			xtasklist.$save(function(response) {
				$location.path('tasklists/' + response._id);

				// Clear form fields
				$scope.name = '';
				$scope.start = '';
				$scope.interval = 'weekly';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		function fillUserObject(){
			var obj = {};
			var counter = 2;
			var starter = false;

			if($scope.xtasklist){
				if(!$scope.allUsers[$scope.first.index].checked) starter = true;
			}

			$scope.allUsers.forEach(function(user){
				if(user.checked){
					if(starter){
						starter = false;
						$scope.first.name = user.username;
					}
					obj[user._id] = {};
					obj[user._id].username = user.username;
					obj[user._id].crt = (user.username === $scope.first.name);
					obj[user._id].howOften = obj[user._id].monthly = obj[user._id].yearly = 0;
					obj[user._id].turn = (user.username === $scope.first.name) ? 1 : counter++;
					obj[user._id].isNext = (obj[user._id].turn !== 2) ? false : true;
					obj[user._id].fullUser = user;

					if($scope.xtasklist){
						if($scope.xtasklist.users[user._id]){
							obj[user._id].crt = $scope.xtasklist.users[user._id].crt;
							obj[user._id].howOften = $scope.xtasklist.users[user._id].howOften;
							obj[user._id].monthly = $scope.xtasklist.users[user._id].monthly;
							obj[user._id].yearly = $scope.xtasklist.users[user._id].yearly;
						}
					}
				}
			});

			return obj;
		}

		// Remove existing Xtasklist
		$scope.remove = function(xtasklist) {
			console.log('remove', xtasklist);
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

		// remove by task
		$scope.removeByTask = function(task,fromDetailView) {
			var path = '/xtasklists/' + task._id;

			$http.delete(path).success(function(task){
				if(fromDetailView){
					$scope.xtasklist = null;
					$location.path('/tasklists');
				} else {
					for(var i in $scope.tasks){
						if ($scope.tasks[i]._id === task._id) {
							$scope.tasks.splice(i, 1);
						}
					}
				}
			}).error(function(response) {
				// Show user error message and clear form
				console.log('error');
				$scope.error = response.message;
				$location.path('/');
			});
		};

		// Update existing Xtasklist
		$scope.update = function() {
			var xtasklist = $scope.xtasklist;
			xtasklist.users = fillUserObject();

			var path = '/xtasklists/' + xtasklist._id;
			$http.put(path, xtasklist).success(function(task){
				$location.path('tasklists/' + task._id);
				$scope.xtasklist = null;
			}).error(function(err){
				$scope.error = err.data.message;
			});

			// xtasklist.$update(function() {
			// 	$location.path('xtasklists/' + xtasklist._id);
			// }, function(errorResponse) {
			// 	$scope.error = errorResponse.data.message;
			// });
		};

		// get all tasks from wg
		$scope.findFromWg = function() {
			// $scope.removeBgClass();
			// console.log('start all from wg');

			$http.get('/xtasklist/all-from-share').success(function(response) {
				// Show user success message and clear form
				// console.log('response', response);
				$scope.tasks = response;
				// console.log('$scope.tasks', $scope.tasks)
				$scope.tasks.forEach(function(task){
					// console.log(task.users);
					for (var userKey in task.users) {
							if(task.users[userKey].crt) {
								task.current = task.users[userKey];
							}
					}
				});
			}).error(function(response) {
				// Show user error message and clear form
				$scope.error = response.message;
			});
		};

		// Find a list of Xtasklists
		$scope.find = function() {
			$scope.removeBgClass();
			$scope.xtasklists = Xtasklists.query();
		};

		// Find existing Xtasklist
		$scope.findOne = function(isForCreation) {
			$scope.removeBgClass();
			$scope.current = null;
			var path = '/xtasklists/' + $stateParams.xtasklistId;

			$http.get(path).success(function(res){
				$scope.xtasklist = res;
				if(!isForCreation) $scope.getUsers(isForCreation);
			}).error(function(err){
				console.log('ERROR', err);
				$rootScope.attr = {};
				$rootScope.attr.stat = err.stat;
				$rootScope.attr.error = err.message;
				// $scope.error = response.message;
				$location.path('/error');
			});

			// $scope.xtasklist = Xtasklists.get({
			// 	xtasklistId: $stateParams.xtasklistId
			// });
		};

		$scope.setCurrent = function(name){
			$scope.current = name;
		};

		$scope.editByList = function(id){
			$location.path('tasklists/' + id + '/edit');
		};

		$scope.checkfirst = function() {
			var count = 0;
			$scope.allUsers.forEach(function(user){
				if(user.checked) count++;
			});
			if(count === 0){ $scope.first.name = null; }
		};

		$scope.setToDone = function(task,index){
			console.log('setToDone');

			if(!task.isDone){
				var xtasklist = task;
				xtasklist.isDone = true;
				xtasklist.users[$scope.authentication.user._id].howOften++;
				xtasklist.users[$scope.authentication.user._id].monthly++;
				xtasklist.users[$scope.authentication.user._id].yearly++;

				var path = '/xtasklists/' + xtasklist._id;
				$http.put(path, xtasklist).success(function(t){
					$scope.tasks[index] = t;
				}).error(function(err){
					$scope.error = err.data.message;
				});
			}
		};

		$scope.getUsers = function(isForCreation) {
			$scope.removeBgClass();
			$scope.interval = 'weekly';
			$scope.curDate = new Date();

			$http.get('/my-share/allusers').success(function(res) {
				$scope.allUsers = res;
				$scope.first = { name: null };
				$scope.totalUser = 0;

				$scope.allUsers.forEach(function(user, index){
					if(user.current){
						$scope.currentUser = user;
					}
					if(isForCreation){
						user.checked = false;
						user.first = false;
					} else {
						$scope.totalUser++;

						if($scope.xtasklist.users[user._id]){
							user.checked = true;
							if($scope.xtasklist.users[user._id].turn === 1){
								$scope.first.name = user.username;
								user.first = true;
								$scope.first.index = index;
							}
						}
					}
				});

			}).error(function(err){
				$scope.error = err.data.message;
			});
		};

		$scope.removeBgClass = function(){
			document.body.style.background = '#fff';
		};
	}
]);
