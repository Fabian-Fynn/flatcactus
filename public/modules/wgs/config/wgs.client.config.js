'use strict';

// Configuring the wgs module
angular.module('wgs').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'my share', 'wgs', 'dropdown', '#');
		Menus.addSubMenuItem('topbar', 'wgs', 'nice menu button', '#');
		Menus.addSubMenuItem('topbar', 'wgs', 'leave this share', '#');
	}
]);
