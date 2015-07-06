'use strict';

// Configuring the Articles module
angular.module('payments').run(['Menus',
	function(Menus) {
		// Set top bar menu items menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position
		Menus.addMenuItem('topbar', 'payments', 'payments', 'dropdown', '/payments(/create)?', false, null, 2);
		Menus.addSubMenuItem('topbar', 'payments', 'list payments', 'payments');
		Menus.addSubMenuItem('topbar', 'payments', 'new payment', 'payments/create');
	}
]);
