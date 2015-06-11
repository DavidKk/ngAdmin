/**
 * Nav Module
 * @author <David Jones qowera@qq.com>
 */
angular.module('nav', [
  'ngRoute'
  , 'ui.slidedown', 'ui.ngIscroll'
  , 'conf.config'
])

.directive('navLayout', [
  '$rootScope',
  function($rootScope) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attrs, ctrl) {
        'use strict'

        $rootScope.$on('nav.$toggle', function($event, isOpen) {
          $scope.isOpen = angular.isDefined(isOpen) ? !!isOpen : !$scope.isOpen
          $scope.isOpen ? open() : close()
        })

        $scope.isOpen = !!$attrs.open
        $scope.isOpen ? open() : close()

        $scope.$on('$routeChangeStart', close)

        function open() {
          $scope.isOpen = true
          $element.removeClass('minify')
          angular.element(document.body).addClass('show-nav')
        }

        function close() {
          $scope.isOpen = false
          $element.addClass('minify')
          angular.element(document.body).removeClass('show-nav')
        }
      }
    }
  }
])

.controller('NavController', [
  '$scope', '$http', '$route', '$location',
  'NAVIGATION',
  function($scope, $http, $route, $location, NAVIGATION) {
    var exports = this;

    $scope.paths;
    $scope.navigations = NAVIGATION;
    $scope.navs = [];
    $scope.hasSub = false;
    $scope.filter = '';

    exports.reload = function() {
      var i = 0
          , paths = $location.$$path
            .replace(/^\//, '')
            .replace(/\/$/, '')
            .split('\/')
          , cur = paths[1]
          , len = $scope.navigations.length
          , index
          , nav
          , j
          , c
          , clen
          , t;

      for (; i < len; i ++) {
        nav = $scope.navigations[i]

        if (cur === nav.key) {
          $scope.navs = [cur]
          break
        }
        else {
          for (j = 0, c = nav.child || [], clen = c.length; j < clen; j ++) {
            t = c[j].key.split('/')

            if (cur == t[0]) {
              $scope.navs = [nav.key, cur]
              break
            }
          }
        }
      }

      $scope.paths = paths
    }

    exports.filter = function(str) {
      var regexp = new RegExp(str, 'ig')

      angular.forEach($scope.navigations, function(nav) {
        if (angular.isArray(nav.child)) {
          nav.hidden = true
          nav.open = false

          angular.forEach(nav.child, function(item) {
            if (!item.name.match(regexp)) {
              item.hidden = true
            }
            else {
              nav.open = true
              nav.hidden = item.hidden = false
            }
          })
        }
        else {
          nav.hidden = !nav.name.match(regexp)
        }
      })
    }

    $scope.$watch('filter', function(filter) {
      exports.filter(filter)
    })

    $scope.$on('$routeChangeSuccess', exports.reload)
    exports.reload()
  }
])