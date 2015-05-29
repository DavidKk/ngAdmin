/**
 * Header
 * @author <David Jones qowera@qq.com>
 */
angular.module('header', [
  'services.screen'
  , 'ui.ngIscroll', 'ui.dropdownMenu'
])

.controller('HeaderController', [
  '$rootScope', '$scope',
  '$screenfull',
  function($rootScope, $scope, $screenfull) {
    $scope.isFullscreen = false

    $scope.toggleLeftSidebar = function() {
      $rootScope.$broadcast('nav.$toggle')
    };

    $scope.toggleRightSidebar = function() {
      $rootScope.$broadcast('chat.$toggle')
    };

    $scope.screenfull = function() {
      $screenfull.toggle()
    }

    $scope.logout = function() {
      window.location.reload()
    }

    $rootScope.$on('fullscreenchange', function() {
      $scope.isFullscreen = $screenfull.isFullscreen
      $scope.$digest()
    })
  }
])