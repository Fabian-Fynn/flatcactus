'use strict';

// Payments controller
angular.module('payments').controller('PaymentsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Payments',
	function($scope, $http, $stateParams, $location, Authentication, Payments) {
		$scope.authentication = Authentication;

		// Create new Payment
		$scope.create = function() {
			// Create new Payment object
			if (this.operation === 'out') {
				this.amount = this.amount * (-1);
			}

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

		$scope.removeBgClass = function(){
			document.getElementById('container_bg').className = 'container';
		};
	}
]);
