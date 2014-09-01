

angular.module('ui.promptBox', [])

.constant('promptBoxConfig', {
  leaveClass: 'leave',
  enterClass: 'in',
  activeClass: 'active',
  delayTime: 3000
})

.service('$promptStack', [
  '$rootScope',
  function($rootScope) {
    var stackedMap = [], openScopes = [];
    this.createNew = function(openScope) {
      stackedMap = angular.isArray(openScope.notice) ? openScope.notice : (openScope.notice = []);
    };

    this.add = function(scope) {
      openScopes.push(scope);
      if (openScopes.length > 5) {
        var i, l = openScopes.length - 5;
        for (i = 0; i < l; i ++) openScopes[i].leave();
      }
    };

    this.dismiss = function(scope) {
      var index = angular.inArray(scope, openScopes);
      openScopes.splice(index, 1);
      stackedMap.splice(index, 1);
    };

    $rootScope.$on('notify', function(event, message, type, title) {
      stackedMap.push({ message: message, type: type, title: title });
    });
  }
])

.directive('promptBox', [
  '$timeout', '$q',
  '$promptStack',
  'promptBoxConfig',
  function($timeout, $q, $promptStack, config) {
    return {
      restrict: 'EA',
      link: function($scope, $element, $attrs) {
        $promptStack.add($scope);

        var transitionPromise,
        timeoutPromise;
        $scope.isClosed = false;

        $scope.fade = function() {
          var callbackDeferred = $q.defer();
          $timeout(function() {
            $element.addClass(config.enterClass);
          });

          $timeout(function() {
            callbackDeferred.resolve();
          }, 500);

          return callbackDeferred.promise;
        };

        $scope.leave = function(event) {
          if ($scope.isClosed) return false;
          if (!event) $scope.isClosed = true;
          $element.addClass(config.leaveClass);

          // 时间等于 css animation 时间
          // 若使用$timeout 会导致 fadeout 期间不断更改信息集合 notice, 而出现闪屏现象
          timeoutPromise = setTimeout(function() {
            $element.remove();
            $promptStack.dismiss($scope);
          }, 500);
        };

        $scope.pause = function() {
          $element.removeClass(config.leaveClass);
          transitionPromise && $timeout.cancel(transitionPromise);
          timeoutPromise && clearTimeout(timeoutPromise);
          transitionPromise = timeoutPromise = undefined;
        };

        $scope.$watch('isClosed', function(value) {
          if (value === true) $scope.leave();
          else $scope.pause();
        });

        $element.on('mouseenter', function() {
          if ($scope.isClosed) return false;
          $scope.pause();
        });

        $element.on('mouseleave', function() {
          if ($scope.isClosed) return false;

          $scope.pause();
          transitionPromise = $timeout(function() {
            $scope.leave(true);
          }, config.delayTime);
        });

        $scope.fade().
        then(function() {
          $element.triggerHandler('mouseleave');
        });
      }
    };
  }
])