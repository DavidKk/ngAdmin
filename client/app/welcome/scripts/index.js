angular.module('welcome', ['ngRoute'])

.config([
  '$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    function redirectTo(url) {
      window.location.replace(url);
    };

    $routeProvider
    .when('/welcome/', {})
    .when('/welcome.html', {})
    .otherwise({
      resolve: [
        '$route', '$location',
        function($route, $location) {
          var firstPath = '/' + $location.$$path.split('\/')[1] + '/',
          url = $location.$$url;

          if ($route.routes[firstPath]) {
            $location.path(firstPath);
          }
          else if (url) {
            window.location.replace(url);
          }
        }
      ]
    });

    $locationProvider.html5Mode(true);
  }
])

.controller('FormController', [
  '$rootScope', '$scope',
  function($rootScope, $scope) {
    $scope.username = '';
    $scope.password = '';
    $scope.captcha = '';
    $scope.captchaImage = '';
    $scope.disabled = false;

    $scope.newCaptcha = function() {
      if ($scope.disabled) return;
      // $scope.captchaImage = 'http://api.xiaozhisong.com/captcha/?' + Date.now();
    };

    $scope.submit = function(event) {
      if ($scope.disabled || (event && event.keyCode && event.keyCode !== 13)) return;

      var validUsername = $scope.form.username.$viewValue,
      validPassword = $scope.form.password.$viewValue,
      validCaptcha = $scope.form.captcha.$viewValue;

      if (validUsername && validPassword && validCaptcha) {
        $scope.disabled = true;

        $user.login({ username: validUsername, password: validPassword, captcha: validCaptcha }).
        then(function(data) { window.location.replace('/index/'); }).
        catch(function(msg) {
          alert(msg);
          
          $scope.disabled = false;
          $scope.captcha = '';
          $scope.newCaptcha();
        });
      }
    };

    $scope.newCaptcha();
  }
])
