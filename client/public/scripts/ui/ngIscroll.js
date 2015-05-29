/**
 * ngIscroll
 * @author <David Jones qowera@qq.com>
 * @package iscroll
 */
angular.module('ui.ngIscroll', [])

.constant('OPEN_SCROLL_CLICK', (function() {
  'use strict'

  if (/iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)) {
    return false
  }

  if (/Chrome/i.test(navigator.userAgent)) {
    return (/Android/i.test(navigator.userAgent))
  }

  if (/Silk/i.test(navigator.userAgent)) {
    return false
  }

  if (/Android/i.test(navigator.userAgent)) {
    var s = navigator.userAgent.substr(navigator.userAgent.indexOf('Android') +8, 3)
    return parseFloat(s[0] + s[3]) < 44 ? false : true
  }
})())

.service('$iscroll', [
  '$rootScope',
  function($rootScope) {
    'use strict'

    var exports = this
        , iscrolls = []

    exports.create = function(element, option) {
      var iscroll = new IScroll(element, option)
      iscrolls.push(iscroll)
      exports.cleanUnuseful()
      return iscroll
    }

    exports.remove = function(index) {
      iscrolls.splice(index, 1)
    }

    exports.cleanUnuseful = function() {
      var i = 0
          , len = iscrolls.length
          , is

      for (; i < len; i ++) {
        is = iscrolls[i]

        if (!angular.element(is.scroller).parent()[0]) {
          is.destroy()
          iscrolls.splice(i --, 1)
        }
      }
    }

    exports.disableOthers = function(iscroll) {
      var index = angular.inArray(iscroll, iscrolls)

      if (-1 !== index) {
        angular.forEach(iscrolls, function(is, k) {
          k === index ? is.disable() : is.enable()
        })
      }
    }

    exports.enableAll = function() {
      angular.forEach(iscrolls, function(is) {
        is.enable()
      })
    }
  }
])

.directive('ngIscroll', [
  '$rootScope',
  'OPEN_SCROLL_CLICK',
  '$iscroll',
  function($rootScope, OPEN_SCROLL_CLICK, $iscroll) {
    return {
      replace: false,
      restrict: 'A',
      scope: {
        snap: '=?snap',
        momentum: '=?momentum',
        scrollbars: '=?scrollbars',
        mouseWheel: '=?mouseWheel',
        scrollbarClass: '=?scrollbarClass'
      },
      link: function ($scope, $element, $attrs) {
        'use strict'

        var options = {
              click: OPEN_SCROLL_CLICK,
              snap: $scope.hasOwnProperty('snap') ? $scope.snap : true,
              momentum: $scope.hasOwnProperty('momentum') ? $scope.momentum : true,
              scrollbars: $scope.hasOwnProperty('scrollbars') ? $scope.scrollbars : 'custom',
              mouseWheel: $scope.hasOwnProperty('mouseWheel') ? $scope.mouseWheel : true,
              scrollbarClass: $scope.hasOwnProperty('scrollbarClass') ? $scope.scrollbarClass : 'ngIscroll'
            }

        // 新建 iscroll
        var myIScroll = $iscroll.create($element[0], options)

        angular.element(window)
        .on('resize', function() {
          setTimeout(function() {
            myIScroll.refresh()
          }, 10)
        })
        .triggerHandler('resize')

        $scope.$watch(function() {
          var elem = $element[0]
          return !(elem.offsetWidth === 0 && elem.offsetHeight === 0)
        }
        , function(isVisible) {
          isVisible && myIScroll.refresh()
        })
      }
    }
  }
])