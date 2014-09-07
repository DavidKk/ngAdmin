

angular.module('header', [])

.controller('Header', [
  '$rootScope', '$scope',
  function($rootScope, $scope) {
    $scope.toggleLeftSidebar = function() {
      $rootScope.$broadcast('layout.toggleLeftSidebar');
    };

    $scope.toggleRightSidebar = function() {
      $rootScope.$broadcast('layout.toggleRightSidebar');
    };

    $scope.logout = function() {
      window.location.reload();
    };
  }
])