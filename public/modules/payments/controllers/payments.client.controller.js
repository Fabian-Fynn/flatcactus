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

		//recalculate amounts (Creation)
		$scope.recalc = function(){
			$scope.remainingAmount = $scope.amount;
			var currentUser;

			if (!$scope.equal) {
				$scope.allUsers.forEach(function(user){
					if (user._id === $scope.authentication.user._id) {
						currentUser = user;
						currentUser.amount = $scope.amount;
					}
				});
				$scope.allUsers.forEach(function(user){
					if (user._id !== $scope.authentication.user._id) {
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

		//recalculate amounts (Update)
		$scope.recalcUpdate = function(){
			$scope.remainingAmount = $scope.payment.amount;
			var currentUser;

			if (!$scope.equal) {
				$scope.payment.users.forEach(function(user){
					if (user._id === $scope.authentication.user._id) {
						currentUser = user;
						currentUser.amount = $scope.payment.amount;
					}
				});
				$scope.payment.users.forEach(function(user){
					if (user._id !== $scope.authentication.user._id) {
						$scope.remainingAmount -= user.amount;
					}
				});
				currentUser.amount = $scope.remainingAmount;
			} else {
				$scope.payment.users.forEach(function(user){
					user.amount = $scope.payment.amount / $scope.payment.users.length;
				});
			}
		};

		//toggle equal split (Creation)
		$scope.checkEqual = function() {
			if ($scope.equal) {
				$scope.allUsers.forEach(function(user){
					user.amount = $scope.amount / $scope.allUsers.length;
				});
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
				$scope.payment.users.forEach(function(user){
					user.amount = $scope.payment.amount / $scope.payment.users.length;
					$scope.remainingAmount = user.amount;
				});
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
			$scope.removeBgClass();
			if ($scope.payment) {
				$scope.allUsers = $scope.payment.users;
			} else {
				$http.get('/my-share/allusers').success(function(res) {
					$scope.allUsers = res;

					$scope.allUsers.forEach(function(user){
						if (user._id === $scope.authentication.user._id) {
								user.creator = true;
						} else {
							user.creator = false;
						}
					});
				}).error(function(err){
					$scope.error = err.data.message;
				});
			}
		};

		$scope.removeBgClass = function(){
			document.body.style.background = '#fff';
		};
	}
]);
