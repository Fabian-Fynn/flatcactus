'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication', 'Upload',
	function($scope, $http, $location, Users, Authentication, Upload) {
		$scope.user = Authentication.user;
		$scope.files = [];

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid) {
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);

				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// delete user
		$scope.deleteUser = function(isValid){
			$scope.success = $scope.error = null;

			if (isValid) {
				$http.delete('/user/delete', $scope.user).success(function(response){ 
					console.log('delete successful');
					Authentication.user = null;
					window.location.href = '/';
				}).error(function(response){
					$scope.error = response.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.$watch('files', function(){
			if($scope.files.length){
				$scope.upload();
				console.log('upload');
			}
		});

		$scope.upload = function(){
			var file = $scope.files[0];
			var user = $scope.user;

			Upload.upload({
				url: 'users/photo',
				file: file
			}).progress(function (evt) {
				var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
				console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
				$scope.progress = progressPercentage;
			}).success(function (data, status, headers, config) {
				$scope.success_photo = true;
				$scope.user.avatar = Authentication.user.avatar = data.img;
			}).error(function(err){
				console.log('error', err);
			});
		};

		$scope.removeBgClass = function(){
			document.body.style.background = '#fff';
		};
	}
]);
