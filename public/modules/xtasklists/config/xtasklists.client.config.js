'use strict';

// Configuring the Articles module
angular.module('xtasklists').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'tasklists', 'xtasklists', 'dropdown', '/xtasklists(/create)?');
		Menus.addSubMenuItem('topbar', 'xtasklists', 'List tasklists', 'tasklists');
		Menus.addSubMenuItem('topbar', 'xtasklists', 'New tasklist', 'tasklists/create');
	}
]);
