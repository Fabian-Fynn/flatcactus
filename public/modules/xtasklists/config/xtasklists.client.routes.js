'use strict';

//Setting up route
angular.module('xtasklists').config(['$stateProvider',
	function($stateProvider) {
		// Xtasklists state routing
		$stateProvider.
		state('listXtasklists', {
			url: '/tasklists',
			templateUrl: 'modules/xtasklists/views/list-xtasklists.client.view.html'
		}).
		state('createXtasklist', {
			url: '/tasklists/create',
			templateUrl: 'modules/xtasklists/views/create-xtasklist.client.view.html'
		}).
		state('viewXtasklist', {
			url: '/tasklists/:xtasklistId',
			templateUrl: 'modules/xtasklists/views/view-xtasklist.client.view.html'
		}).
		state('editXtasklist', {
			url: '/tasklists/:xtasklistId/edit',
			templateUrl: 'modules/xtasklists/views/edit-xtasklist.client.view.html'
		});
	}
]);
