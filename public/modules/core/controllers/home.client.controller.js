'use strict';


angular.module('core').controller('HomeController', ['$rootScope', '$scope', 'Authentication', 'Flat', 'Wgs', '$http',
	function($rootScope, $scope, Authentication, Flat, Wgs, $http) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.wg = Wgs.get({
			wgId: $scope.authentication.user.wg_id
		}, function(){
			$scope.weather = getWeather($scope.wg.city + ', ' + $scope.wg.country);
			$scope.users = $scope.wg.users;
			$scope.globale = {};
			$scope.globale.wg = $scope.wg;
		});

		$rootScope.wg = $scope.wg;
		$scope.flat = Flat;
		$rootScope.flat = Flat;
		$scope.hasWg = ($scope.authentication.user.wg_id === null) ? false : true;

		$scope.addBgClass = function(){
			document.body.style.background = 'url(/modules/core/img/brand/bg_another.jpg) no-repeat center center fixed';
		};

		$scope.getError = function(){
			document.getElementById('container_bg').className = 'container';
			$scope.stat = $rootScope.attr.stat;
			$scope.error = $rootScope.attr.error;
			$rootScope.attr = null;
		};

/**
 * Code from http://jsfiddle.net/huAxS/2/
 */
		function getWeather(location) {
			var weather = { temp: {}, clouds: null };
			$http.jsonp('http://api.openweathermap.org/data/2.5/weather?q=' + location +'&units=metric&callback=JSON_CALLBACK').success(function(data) {
					if (data) {
							if (data.main) {
									weather.temp.current = data.main.temp;
									weather.temp.min = data.main.temp_min;
									weather.temp.max = data.main.temp_max;
							}
							weather.clouds = data.clouds ? data.clouds.all : undefined;
					}
			});

			return weather;
		}
	}
]);

/**
 * Code from http://jsfiddle.net/huAxS/2/
 */

angular.module('core').filter('temp', function($filter) {
    return function(input, precision) {
        precision = 1;

        var numberFilter = $filter('number');
        return numberFilter(input, precision) + '\u00B0C';
    };
});

angular.module('core').directive('weatherIcon', function() {
    return {
        restrict: 'E', replace: true,
        scope: {
            cloudiness: '@'
        },
        controller: function($scope) {
            $scope.imgurl = function() {
                var baseUrl = 'https://ssl.gstatic.com/onebox/weather/128/';
                if ($scope.cloudiness < 20) {
                    return baseUrl + 'sunny.png';
                } else if ($scope.cloudiness < 90) {
                   return baseUrl + 'partly_cloudy.png';
                } else {
                    return baseUrl + 'cloudy.png';
                }
            };
        },
        template: '<div style="float:left"><img ng-src="{{ imgurl() }}"></div>'
    };
});

angular.module('core')
.config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
      colours: ['#ffbf00', '#fbd843'],
			showScale:true,
      responsive: true,
			scaleBeginAtZero : false
    });
    // Configure all line charts
    ChartJsProvider.setOptions('Line', {
      datasetFill: false
    });
  }])
.controller('BarCtrl', ['$scope','Authentication',  'Wgs', 'Users', '$http', function ( $scope,  Authentication, Wgs, Users, $http) {
	$scope.labels = [];
	$scope.series = [];
	$scope.data = [[]];

	$http.get('/my-share/allusers').success(function(res) {
		$scope.allUsers = res;
		res.forEach(function(user){
			$scope.data[0].push(user.balance);
			$scope.labels.push(user.firstName);
		});
	}).error(function(err){
		$scope.error = err.data.message;
	});

}]);
