'use strict';


angular.module('core').controller('HomeController', ['$rootScope', '$scope', 'Authentication', 'Flat',
	function($rootScope, $scope, Authentication, Flat) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.flat = Flat;
		$scope.hasWg = ($scope.authentication.user.wg_id === null) ? false : true;

		$scope.addBgClass = function(){
			document.body.style.background = 'url(/modules/core/img/brand/bg_another.jpg) no-repeat center center fixed';
		};

		$scope.getError = function(){
			document.getElementById('container_bg').className = 'container';
			$scope.stat = $rootScope.attr.stat;
			$scope.error = $rootScope.attr.error;
			$rootScope.attr = null;
		};
	}
]);
