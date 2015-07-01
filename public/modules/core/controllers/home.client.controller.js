'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Flat',
	function($scope, Authentication, Flat) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.flat = Flat;
		$scope.hasWg = ($scope.authentication.user.wg_id === null) ? false : true;

		$scope.addBgClass = function(){
			document.getElementById('container_bg').className = "container bg-index";
		};
	}
]);
