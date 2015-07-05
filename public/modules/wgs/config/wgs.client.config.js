'use strict';

// Configuring the wgs module
angular.module('wgs').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'share', 'wgs', 'dropdown', '#');
		Menus.addSubMenuItem('topbar', 'wgs', 'passphrase', 'my-share/passphrase');
		Menus.addSubMenuItem('topbar', 'wgs', 'leave this share', 'my-share/leave');
	}
]);
