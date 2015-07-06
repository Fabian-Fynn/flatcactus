'use strict';

//Setting up route
angular.module('shoppinglists').config(['$stateProvider',
	function($stateProvider) {
		// Shoppinglists state routing
		$stateProvider.
		state('listShoppinglists', {
			url: '/shoppinglists',
			templateUrl: 'modules/shoppinglists/views/list-shoppinglists.client.view.html'
		}).
		state('createShoppinglist', {
			url: '/shoppinglists/create',
			templateUrl: 'modules/shoppinglists/views/create-shoppinglist.client.view.html'
		}).
		state('viewShoppinglist', {
			url: '/shoppinglists/:shoppinglistId',
			templateUrl: 'modules/shoppinglists/views/view-shoppinglist.client.view.html'
		}).
		state('editShoppinglist', {
			url: '/shoppinglists/:shoppinglistId/edit',
			templateUrl: 'modules/shoppinglists/views/edit-shoppinglist.client.view.html'
		});
	}
]);