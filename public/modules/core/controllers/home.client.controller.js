'use strict';


angular.module('core').controller('HomeController', ['$rootScope', '$scope', 'Authentication', 'Flat', 'Wgs', '$http', '$location',
	function($rootScope, $scope, Authentication, Flat, Wgs, $http, $location) {
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
		$scope.hasWg = ($scope.authentication.user.wg_id) ? true : false;

		$scope.addBgClass = function(){
			$scope.dateTick();
			document.body.style.background = 'url(/modules/core/img/brand/bg_another.jpg) no-repeat center center fixed';
		};

		$scope.getError = function(){
			document.getElementById('container_bg').className = 'container';
			$scope.stat = $rootScope.attr.stat;
			$scope.error = $rootScope.attr.error;
			$rootScope.attr = null;
		};

		$scope.updateTasks = function(){
			if($scope.authentication.user.wg_id){
				$scope.taskUpdates = null;
				var date = new Date();

				if(!$scope.taskUpdates || $scope.taskUpdates.getDay() < date.getDay())
					$http.post('/xtasklists/updateAll').success(function(err, res){
						$scope.taskUpdates = new Date();
						console.log('WORKED');
					}).error(function(res){
						console.log('ERROR');
					});
			}
		};

		// Check if Date hase to be updated
		$scope.dateTick = function() {
			var weekday = [
				'Sunday',
				'Monday',
				'Tuesday',
				'Wednesday',
				'Thursday',
				'Friday',
				'Saturday'
			];

			var months = [
				'Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
			];

			var date = new Date();
			$scope.weekday = weekday[date.getDay()];
			$scope.date = date.getDate() + '. ' +
				months[date.getMonth()] + ' ' +
				date.getFullYear();

			//If 23:53 or late check time every 0.5 sec else every 5 min
			if (date.getHours() >= 23 && date.getMinutes() >= 53){
				setTimeout($scope.dateTick, 500);
			} else {
				setTimeout($scope.dateTick, 300000);
			}
		};

		$scope.loggon = function(){
			var data = {
				user: $scope.authentication.user,
				socketID: socket.io.engine.id
			};
			$http.post('/wgs/loggon', data);
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
