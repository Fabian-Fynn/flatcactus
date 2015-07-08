'use strict';

// Configuring the wgs module
angular.module('wgs').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		// Menus.addMenuItem('topbar', 'share', 'wgs', 'dropdown', '#');
		// Menus.addSubMenuItem('topbar', 'wgs', 'passphrase', 'my-share/passphrase');
		// Menus.addSubMenuItem('topbar', 'wgs', 'leave this share', 'my-share/leave');
		Menus.addMenuItem('topbar', 'share', 'wgs', 'dropdown', '#', false, null, 0);
		Menus.addSubMenuItem('topbar', 'wgs', 'edit flat-share', 'my-share/edit');
		Menus.addSubMenuItem('topbar', 'wgs', 'shoppinglist', 'shoppinglists');
		Menus.addSubMenuItem('topbar', 'wgs', 'passphrase', 'my-share/passphrase');
		Menus.addSubMenuItem('topbar', 'wgs', 'leave this share', 'my-share/leave');
	}
]);
