

angular.module('config', [])
.constant('CDN_PATH', 'http://cdn.xiaozhisong.com')
.config([
  '$httpProvider',
  function ($httpProvider) {
    // Reset headers to avoid OPTIONS request (aka preflight)
    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.defaults.transformRequest = [function(data) {
      return angular.isObject(data) && String(data) !== '[object File]' ? angular.parseString(data) : data;
    }];

    $httpProvider.interceptors.push('httpInterceptor');
  }
])

.factory('httpInterceptor', [
  '$rootScope', '$q',
  function($rootScope, $q) {
    return {
      responseError: function(rejection) {
        if (400 <= rejection.status && rejection.status < 500) $rootScope.$broadcast('notify', 'sorry！api地址失踪了O__O"…，难道又罢工去饮果汁了？状态：' + rejection.status, 'error');
        else if (500 <= rejection.status && rejection.status < 600) $rootScope.$broadcast('notify', 'sorry！api系统挂了O__O"…，后端程序猿不给力啊。状态：' + rejection.status, 'error');
        else $rootScope.$broadcast('notify', 'sorry！系统代码出问题了，请立即联系管理猿。状态：' + rejection.status, 'error');
        return $q.reject(rejection);
      }
    }
  }
])