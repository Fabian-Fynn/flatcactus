'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		var name = $scope.authentication.user;
		$scope.name = (name) ? name.username : 'you';
	}
]);
