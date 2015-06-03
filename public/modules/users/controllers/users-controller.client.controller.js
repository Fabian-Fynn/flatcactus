'use strict';

angular.module('users').controller('UsersController', ['$scope', , '$http', '$stateParams', '$location', 'Authentication', 'Users',
  function($scope, $http, $stateParams, $location, Authentication) {
    $scope.authentication = Authentication;
  		//Find existing Wg by user
    $scope.findById = function(userid) {
      $scope.user = User.get({
        username: 'Fabi'
      });
    };
	}
]);
