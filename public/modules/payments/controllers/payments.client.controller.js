'use strict';

// Payments controller
angular.module('payments').controller('PaymentsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Payments', 'Users',
	function($scope, $http, $stateParams, $location, Authentication, users, Payments) {
		$scope.authentication = Authentication;
		$scope.equal = true;
		$scope.remainingAmount = 999999999999;
		$scope.devidableAmount = $scope.amount;

		// Create new Payment
		$scope.create = function() {
			// Create new Payment object
			$scope.allUsers.forEach(function(user){
				if (user._id == $scope.authentication.user._id) {
					user.amount = $scope.amount;
				}
				else {
					user.amount = 0;
				}
			});

			var payment = new Payments ({
				name: this.name,
				amount: this.amount
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
			console.log('start all from wg');

			$http.get('/payment/all-from-share').success(function(response) {
				// Show user success message and clear form
				console.log('response', response);
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

		$scope.recalc = function(){
			$scope.remainingAmount = $scope.amount;
			var currentUser;
			console.log('YOLO');

			if (!$scope.equal) {
				$scope.allUsers.forEach(function(user){
					if (user._id == $scope.authentication.user._id) {
						currentUser = user;
						currentUser.amount = $scope.amount;
					}
				});
				$scope.allUsers.forEach(function(user){
					if (user._id != $scope.authentication.user._id) {
						$scope.remainingAmount -= user.amount;
					}
				});
				currentUser.amount = $scope.remainingAmount;
			} else {
				$scope.allUsers.forEach(function(user){
					user.amount = $scope.amount / $scope.allUsers.length;
				});
			}
		};

		$scope.checkEqual = function() {
			console.log($scope.allUsers.length);
			console.log($scope);

			if ($scope.equal) {
				$scope.allUsers.forEach(function(user){
					user.amount = $scope.amount / $scope.allUsers.length;
				});
			} else {
				$scope.allUsers.forEach(function(user){
					if (user._id == $scope.authentication.user._id) {
						user.amount = $scope.amount;
					}
					else {
						user.amount = 0;
					}
				});
			}
		}

		$scope.getUsers = function() {
			$scope.removeBgClass();
			console.log('getUsers');
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

		$scope.removeBgClass = function(){
			document.getElementById('container_bg').className = 'container';
		};
	}
]);
