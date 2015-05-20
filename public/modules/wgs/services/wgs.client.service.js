'use strict';

//Wgs service used to communicate Wgs REST endpoints
angular.module('wgs').factory('Wgs', ['$resource',
	function($resource) {
		return $resource('wgs/:wgId', { wgId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);