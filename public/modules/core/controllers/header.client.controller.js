'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Flat', 'Menus',
	function($scope, Authentication, Flat, Menus) {
		$scope.authentication = Authentication;
		$scope.flat = Flat;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
