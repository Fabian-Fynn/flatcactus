'use strict';

//Setting up route
angular.module('wgs').config(['$stateProvider',
	function($stateProvider) {
		// Wgs state routing
		$stateProvider.
		/*state('listWgs', {
			url: '/wgs',
			templateUrl: 'modules/wgs/views/list-wgs.client.view.html'
		}).*/
		state('joinWg', {
			url: '/wgs/join',
			templateUrl: 'modules/wgs/views/join-wg.client.view.html'
		}).
		state('createWg', {
			url: '/wgs/create',
			templateUrl: 'modules/wgs/views/create-wg.client.view.html'
		}).
		// state('viewWg', {
		// 	url: '/wgs/:wgId',
		// 	templateUrl: 'modules/wgs/views/view-wg.client.view.html'
		// }).
		state('editWg', {
			url: '/my-share/edit',
			templateUrl: 'modules/wgs/views/edit-wg.client.view.html'
		}).
		state('passWg', {
			url: '/my-share/passphrase',
			templateUrl: 'modules/wgs/views/pass-wg.client.view.html'
		}).
		state('leaveWg', {
			url: '/my-share/leave',
			templateUrl: 'modules/wgs/views/leave-wg.client.view.html'
		});
	}
]);
