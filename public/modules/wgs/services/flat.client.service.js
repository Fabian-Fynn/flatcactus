'use strict';

// Flat service for wg variables
angular.module('wgs').factory('Flat', [
	function() {
		console.log(this);
		var _this = this;

		_this._data = {
			wg: window.wg
		};

		return _this._data;
	}
]);
