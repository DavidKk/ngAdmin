/**
 * Config
 * @author  <David Jones qowera@qq.com>
 */
angular.module('conf.config', ['ngRoute', 'helpers.util'])

// Debug Config
.config([
  '$logProvider',
  function($logProvider) {
    'use strict'

    var uri
        , params
        , isDebug;

    if (angular.isBoolean(angular.$debug)) {
      $logProvider.debugEnabled(angular.$debug)
    }
    else {
      uri = angular.parseUrl(window.location.href)
      params = angular.parseObject(uri.query)
      isDebug = 1 == params.debug

      $logProvider.debugEnabled(isDebug)
      angular.$debug = isDebug
    }
  }
])

// Setting ajax configuration.
.config([
  '$httpProvider',
  function ($httpProvider) {
    'use strict'

    /**
     * Reset headers to avoid OPTIONS request (aka preflight)
     * Angular 默认没有设置 urlencoded
     */
    $httpProvider.defaults.headers.common = {}
    $httpProvider.defaults.headers.post = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }

    $httpProvider.defaults.headers.put = {}
    $httpProvider.defaults.headers.patch = {}
    $httpProvider.defaults.withCredentials = true
    $httpProvider.defaults.transformRequest = [
      function(data) {
        return angular.isObject(data) && String(data) !== '[object File]'
          ? angular.parseString(data)
          : data
      }
    ]

    $httpProvider.interceptors.push('httpInterceptor')
  }
])

// Setup the base router.
.config([
  '$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    'use strict'

    /**
     * 默认路由
     * 默认路由跳转到404页面
     */
    $routeProvider
    .when('/404/', {
      resolve: {
        redirect: function() {
          window.location.replace('/error/404/')
        }
      }
    })
    .otherwise({
      redirectTo: '/error/404/'
    })

    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    })
  }
])

// Setting the error response of ajax request.
.factory('httpInterceptor', [
  '$rootScope', '$q',
  function($rootScope, $q) {
    'use strict'

    return {
      responseError: function(rejection) {
        400 <= rejection.status && rejection.status < 500
        ? $rootScope.$broadcast('notify', 'sorry！系统无法访问，请刷新再试或联系客服人员。状态：' + rejection.status, 'error')
        : 500 <= rejection.status && rejection.status < 600
          ? $rootScope.$broadcast('notify', 'sorry！系统繁忙，请稍后再试或联系客服人员。状态：' + rejection.status, 'error')
          : $rootScope.$broadcast('notify', 'sorry！系统出错，请立即联系客服人员。状态：' + rejection.status, 'error')

        return $q.reject(rejection)
      }
    }
  }
])