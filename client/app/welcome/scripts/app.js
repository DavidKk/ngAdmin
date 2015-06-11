/**
 * Welcome
 * @author  <David Jones qowera@qq.com>
 */
angular.module('welcome', ['ngRoute', 'conf.config'])

.config([
  '$routeProvider',
  function($routeProvider) {
    'use strict'

    $routeProvider.when('/welcome/', {
      controller: 'WelcomeController'
    })
  }
])

.controller('WelcomeController', [
  '$scope',
  function($scope) {
    'use strict'

    $scope.method = 'login'

    $scope.changeChannel = function(method) {
      $scope.method = method
    }
  }
])

.controller('FormController', [
  '$rootScope', '$scope',
  function($rootScope, $scope) {
    'use strict'

    $scope.username = ''                // 用户名
    $scope.password = ''                // 密码
    $scope.captcha = ''                 // 验证码
    $scope.captchaImage = ''            // 验证码图片
    $scope.disabled = false             // 当前是否可用

    $scope.newCaptcha = function() {
      if ($scope.disabled) {
        return
      }
      // $scope.captchaImage = 'http://api.xiaozhisong.com/captcha/?' + Date.now();
    }

    $scope.submit = function(evt) {
      if ($scope.disabled || (evt && evt.keyCode && evt.keyCode !== 13)) {
        return
      }

      var validUsername = $scope.form.username.$viewValue
          , validPassword = $scope.form.password.$viewValue
          , validCaptcha = $scope.form.captcha.$viewValue

      if (validUsername && validPassword && validCaptcha) {
        $scope.disabled = true

        $user.login({ username: validUsername, password: validPassword, captcha: validCaptcha })
        .then(function(data) {
          window.location.replace('/index/')
        })
        .catch(function(msg) {
          $scope.disabled = false
          $scope.captcha = ''
          $scope.newCaptcha()
        })
      }
    }

    $scope.newCaptcha()
  }
])
