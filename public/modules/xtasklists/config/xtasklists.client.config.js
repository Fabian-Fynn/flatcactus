'use strict';

// Configuring the Articles module
angular.module('xtasklists').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'tasks', 'xtasklists', 'dropdown', '#');
		Menus.addSubMenuItem('topbar', 'xtasklists', 'List tasks', 'tasklists');
		Menus.addSubMenuItem('topbar', 'xtasklists', 'New tasklist', 'tasklists/create');
	}
]);
