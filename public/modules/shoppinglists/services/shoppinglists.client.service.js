'use strict';

//Shoppinglists service used to communicate Shoppinglists REST endpoints
angular.module('shoppinglists').factory('Shoppinglists', ['$resource',
	function($resource) {
		return $resource('shoppinglists/:shoppinglistId', { shoppinglistId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);