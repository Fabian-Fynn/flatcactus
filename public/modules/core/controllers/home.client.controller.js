'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.hasWg = ($scope.authentication.user.wg_id === null) ? false : true;
		console.log('wg', $scope.hasWg);
		console.log('authen', $scope.authentication);

		var name = $scope.authentication.user;
		$scope.name = (name) ? name.username : 'you';
	}
]);
