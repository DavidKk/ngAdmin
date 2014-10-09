

angular.module('header', [])

.controller('Header', [
  '$rootScope', '$scope',
  function($rootScope, $scope) {
    $scope.toggleLeftSidebar = function() {
      $rootScope.$broadcast('layout.toggle.navigation');
    };

    $scope.toggleRightSidebar = function() {
      $rootScope.$broadcast('layout.toggle.chat');
    };

    $scope.logout = function() {
      window.location.reload();
    };
  }
])