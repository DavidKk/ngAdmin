/**
 * Screen
 * @author <David Jones qowera@qq.com>
 */
angular.module('services.screen', [])

.factory('$screenfull', [
  '$rootScope',
  function($rootScope) {
    'use strict'

    var isCommonjs = typeof module !== 'undefined' && module.exports
        , keyboardAllowed = typeof Element !== 'undefined' && 'ALLOW_KEYBOARD_INPUT' in Element

    var fn = (function () {
      var val
          , valLength
          , fnMap = [
            [
              'requestFullscreen',
              'exitFullscreen',
              'fullscreenElement',
              'fullscreenEnabled',
              'fullscreenchange',
              'fullscreenerror'
            ],
            // new WebKit
            [
              'webkitRequestFullscreen',
              'webkitExitFullscreen',
              'webkitFullscreenElement',
              'webkitFullscreenEnabled',
              'webkitfullscreenchange',
              'webkitfullscreenerror'
            ],
            // old WebKit (Safari 5.1)
            [
              'webkitRequestFullScreen',
              'webkitCancelFullScreen',
              'webkitCurrentFullScreenElement',
              'webkitCancelFullScreen',
              'webkitfullscreenchange',
              'webkitfullscreenerror'
            ],
            [
              'mozRequestFullScreen',
              'mozCancelFullScreen',
              'mozFullScreenElement',
              'mozFullScreenEnabled',
              'mozfullscreenchange',
              'mozfullscreenerror'
            ],
            [
              'msRequestFullscreen',
              'msExitFullscreen',
              'msFullscreenElement',
              'msFullscreenEnabled',
              'MSFullscreenChange',
              'MSFullscreenError'
            ]
          ]

      var i = 0
          , l = fnMap.length
          , ret = {}

      for (; i < l; i++) {
        val = fnMap[i]

        if (val && val[1] in document) {
          for (i = 0, valLength = val.length; i < valLength; i++) {
            ret[fnMap[0][i]] = val[i]
          }

          return ret
        }
      }

      return false
    })()

    var screenfull = {
      request: function (elem) {
        var request = fn.requestFullscreen
        elem = elem || document.documentElement

        // Work around Safari 5.1 bug: reports support for
        // keyboard in fullscreen even though it doesn't.
        // Browser sniffing, since the alternative with
        // setTimeout is even worse.
        ;/5\.1[\.\d]* Safari/.test(navigator.userAgent)
        ? elem[request]()
        : elem[request](keyboardAllowed && Element.ALLOW_KEYBOARD_INPUT);
      },
      exit: function () {
        document[fn.exitFullscreen]()
      },
      toggle: function (elem) {
        this.isFullscreen
        ? this.exit()
        : this.request(elem)
      },
      raw: fn
    }

    Object.defineProperties(screenfull, {
      isFullscreen: {
        get: function () {
          return !!document[fn.fullscreenElement]
        }
      },
      element: {
        enumerable: true,
        get: function () {
          return document[fn.fullscreenElement]
        }
      },
      enabled: {
        enumerable: true,
        get: function () {
          // Coerce to boolean in case of old WebKit
          return !!document[fn.fullscreenEnabled]
        }
      }
    })

    angular.element(document)
    .on(screenfull.raw.fullscreenchange, function() {
      $rootScope.$broadcast('fullscreenchange', screenfull.isFullscreen)
    })

    return screenfull
  }
])