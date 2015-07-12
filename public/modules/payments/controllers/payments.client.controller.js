'use strict';

// Payments controller
angular.module('payments').controller('PaymentsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Users', 'Payments',
	function($scope, $http, $stateParams, $location, Authentication, users, Payments) {
		$scope.authentication = Authentication;

		// Create new Payment
		$scope.create = function() {
			// Create new Payment object

			var payment = new Payments ({
				name: this.name,
				amount: this.amount,
				users: this.allUsers
			});

			// Redirect after save
			payment.$save(function(response) {
				$location.path('payments/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		$scope.payEven = function() {
			$scope.allUsers.forEach(function(user){
				user.amount = user.balance
			});

			var payment = new Payments ({
				name: 'Debt payback',
				amount: 0,
				users: this.allUsers
			});

			// Redirect after save
			payment.$save(function(response) {
				$location.path('payments/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Payment
		$scope.remove = function(payment) {
			if ( payment ) {
				payment.$remove();

				for (var i in $scope.payments) {
					if ($scope.payments [i] === payment) {
						$scope.payments.splice(i, 1);
					}
				}
			} else {
				$scope.payment.$remove(function() {
					$location.path('payments');
				});
			}
		};

		// Update existing Payment
		$scope.update = function() {
			var payment = $scope.payment;

			payment.$update(function() {
				$location.path('payments/' + payment._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// get all payments from wg
		$scope.findFromWg = function() {
			$scope.removeBgClass();

			$http.get('/payment/all-from-share').success(function(response) {
				// Show user success message and clear form
				$scope.payments = response;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.error = response.message;
			});
		};

		// Find a list of Payments
		$scope.find = function() {
			$scope.removeBgClass();
			$scope.payments = Payments.query();
		};

		// Find existing Payment
		$scope.findOne = function() {
			$scope.removeBgClass();
			$scope.payment = Payments.get({
				paymentId: $stateParams.paymentId
			});
		};

		//recalculate amounts (Creation)
		$scope.recalc = function(){
			$scope.othersAmount = 0;
			var currentUser;

			//split equally is deactivated
			if (!$scope.equal) {
				var count = 0;
				$scope.allUsers.forEach(function(user){
					if (user._id === $scope.authentication.user._id) {
						currentUser = count; //remember currentUser
					}
					else {
						if($scope.allUsers[count].amount) {

								$scope.othersAmount += $scope.allUsers[count].amount; //add other users amounts
						}
					}
					count++;
				});

				//give current user remaining amount or total amount
				if ($scope.othersAmount > 0) {
					$scope.allUsers[currentUser].amount = -$scope.othersAmount;
				} else {
					$scope.allUsers[currentUser].amount = $scope.amount;
				}
			}
			//split equally
			else {
				$scope.allUsers.forEach(function(user){
					//give every user the same amount, except for the creator
					if (user._id !== $scope.authentication.user._id) {
						user.amount = $scope.amount / $scope.allUsers.length;
					} else {
						user.amount = -($scope.amount / $scope.allUsers.length * ($scope.allUsers.length - 1));
					}
				});
			}
		};

		//recalculate amounts (Update)
		$scope.recalcUpdate = function(){
			$scope.othersAmount = 0;
			$scope.allUsers = $scope.payment.users;
			if (!$scope.amount) {
				$scope.amount = $scope.payment.amount;
			}
			var currentUser;

			if (!$scope.equal) {
				$scope.payment.users.forEach(function(user){
					if (user._id === $scope.authentication.user._id) {
						currentUser = user;
					}
				});
				$scope.payment.users.forEach(function(user){
					if (user._id !== $scope.authentication.user._id) {
						$scope.othersAmount += user.amount;
					}
				});

				if ($scope.othersAmount > 0) {
					currentUser.amount = -$scope.othersAmount;
				} else {
					currentUser.amount = $scope.payment.amount;
				}
			} else {
				$scope.payment.users.forEach(function(user){
					if (user._id !== $scope.authentication.user._id) {
						user.amount = $scope.payment.amount / $scope.payment.users.length;
					} else {
						user.amount = -($scope.payment.amount / $scope.payment.users.length * ($scope.payment.users.length - 1));
					}
				});
			}
		};

		//toggle equal split (Creation)
		$scope.checkEqual = function() {
			if ($scope.equal) {
				$scope.recalc();
			} else {
				$scope.allUsers.forEach(function(user){
					if (user._id === $scope.authentication.user._id) {
						user.amount = $scope.amount;
					}
					else {
						user.amount = 0;
					}
				});
			}
		};

		//toggle equal split (Update)
		$scope.checkEqualUpdate = function() {
			if ($scope.equal) {
				$scope.recalcUpdate();
			} else {
				$scope.payment.users.forEach(function(user){
					if (user._id === $scope.authentication.user._id) {
						user.amount = $scope.payment.amount;
					}
					else {
						user.amount = 0;
					}
				});
			}
		};

		$scope.getUsers = function() {
			$scope.even = true;
			if ($scope.payment) {
				$scope.allUsers = $scope.payment.users;
			} else {
				if($scope.authentication.user.wg_id){
					$http.get('/my-share/allusers').success(function(res) {
						$scope.allUsers = res;

						$scope.allUsers.forEach(function(user){
							if (user._id === $scope.authentication.user._id) {
									user.creator = true;
							} else {
								user.creator = false;
							}
							//check if any user has a debt/credit
							if (user.balance) {
								if (user.balance !== 0) {
									$scope.even = false;
								}
							}
						});
					}).error(function(err){
						$scope.error = err.data.message;
					});
				}
			}
		};

		$scope.removeBgClass = function(){
			document.body.style.background = '#fff';
		};
	}
]).controller('LineCtrl', ['$scope','Authentication',  'Wgs', 'Users', '$http', function ( $scope,  Authentication, Wgs, Users, $http) {
	$scope.labels = [];
	$scope.series = ['Total'];
	$scope.data = [[]];
	$scope.legend = true;

	$http.get('/payment/all-from-share').success(function(response) {
		$scope.payments = response;
		var payments = response.splice(0, 25);
		payments.reverse();
		var allUsers = [];

		for (var i = 0; i < payments.length; i++) {
			$scope.data[0].push(payments[i].amount);
			$scope.labels.push(payments[i].name);

			for (var j = 0; j < payments[i].users.length; j++) {
				var user = payments[i].users[j];
				if (calcUserIndex(user, allUsers) === -1) {
					allUsers.push(user);
					$scope.series.push(user.firstName);
					$scope.data.push(new Array());
				}
				$scope.data[calcUserIndex(user, allUsers)].push(payments[i].users[j].amount);
			}
		}

		function calcUserIndex(obj, list) {
	    var i;
	    for (i = 1; i <= list.length; i++) {
	        if (list[i-1]._id === obj._id) {
	            return i;
	        }
	    }
    	return -1;
		}
	}).error(function(response) {
		// Show user error message and clear form
		$scope.error = response.message;
	});
}]);
