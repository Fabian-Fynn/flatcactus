'use strict';

//Xtasklists service used to communicate Xtasklists REST endpoints
angular.module('xtasklists').factory('Xtasklists', ['$resource',
	function($resource) {
		return $resource('xtasklists/:xtasklistId', { xtasklistId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);