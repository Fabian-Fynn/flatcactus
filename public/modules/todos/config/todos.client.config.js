'use strict';

// Configuring the Articles module
angular.module('todos').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		// Menus.addMenuItem('topbar', 'todos', 'todos', 'dropdown', '/todos(/create)?', false, null, 3);
		// Menus.addSubMenuItem('topbar', 'wgs', 'ntodos', 'todos');
		// Menus.addSubMenuItem('topbar', 'todos', 'New Todo', 'todos/create');
		Menus.addMenuItem('topbar', 'share', 'wgs', 'dropdown', '#', false, null, 0);
		Menus.addSubMenuItem('topbar', 'wgs', 'edit flat-share', 'my-share/edit');
		Menus.addSubMenuItem('topbar', 'wgs', 'shoppinglist', 'shoppinglists');
		Menus.addSubMenuItem('topbar', 'wgs', 'passphrase', 'my-share/passphrase');
		Menus.addSubMenuItem('topbar', 'wgs', 'leave this share', 'my-share/leave');
	}
]);
