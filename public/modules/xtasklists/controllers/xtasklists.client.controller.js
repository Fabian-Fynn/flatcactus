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
				crtUser: $scope.first.name // is the user-id
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
						$scope.first.name = user._id;
					}

					obj[user._id] = {};
					obj[user._id]._id = user._id;
					obj[user._id].username = user.displayName;
					obj[user._id].howOften = obj[user._id].monthly = obj[user._id].yearly = 0;
					obj[user._id].turn = (user._id === $scope.first.name) ? 1 : counter++;
					obj[user._id].isNext = (obj[user._id].turn !== 2) ? false : true;

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
			console.log('remove task');
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
			$http.get('/xtasklist/all-from-share').success(function(response) {
				// Show user success message and clear form
				console.log('got all tasks from wg');
				$scope.tasks = response;
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

		$scope.toTask = function(id){
			$location.path('tasklists/' + id);
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
				xtasklist.users[xtasklist.crtUser._id].howOften++;
				xtasklist.users[xtasklist.crtUser._id].monthly++;
				xtasklist.users[xtasklist.crtUser._id].yearly++;

				var path = '/xtasklists/' + xtasklist._id;
				$http.put(path, xtasklist).success(function(t){
					$scope.tasks[index] = t;
				}).error(function(err){
					$scope.error = err.data.message;
				});
			}
		};

		$scope.setNewCrtUser = function(task, index){
			console.log('take over task');
			if(!task.isDone){
				var xtasklist = task;
				xtasklist.crtUser = $scope.authentication.user._id;

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
								$scope.first.name = user._id;
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
]).controller('TaskChartCtrl', ['$scope','Authentication',  'Wgs', 'Users', '$http', '$location', '$stateParams', function ( $scope,  Authentication, Wgs, Users, $http, $location, $stateParams) {
	$scope.labels = [];
	$scope.series = ['this month', 'this year'];
	$scope.data = [[],[]];
	var allUsers = [];

	$http.get('/xtasklists/' + $stateParams.xtasklistId).success(function(res){
		$scope.xtasklist = res;
		var users = $scope.xtasklist.users

		for (var key in users) {
			if (users.hasOwnProperty(key)) {
				console.log('users[key]',users[key]);
				var user = users[key];

				if (calcUserIndex(user, allUsers) === -1) {
					allUsers.push(user);
				}
				$scope.labels.push(user.username);
				$scope.data[0].push(user.monthly);
				$scope.data[1].push(user.yearly);
			}
		}
	});

	function calcUserIndex(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i]._id === obj._id) {
            return i;
        }
    }
  	return -1;
	}
}]);
