/**
 * @name Simulator
 * @author <David Jones qowera@qq.com>
 */
angular.module('simulator', [])

.constant('SIMULATOR_CONSTANT', {
  FRAME_NAME: 'node-frame',
  PLACEHOLDER_NAME: 'dragger-placeholder',
  DRAGGER_LOCK_CLASS: 'simulator-draging',

  TEMPLATE_PATH: 'tpls/partials/simulator/',
  DRAGGER_SHADOW_TEMPLATE: 'dragger-shadow.html',
  DRAGGER_PLACEHOLDER_TEMPLATE: 'dragger-placeholder.html',
  VIEWPORT_ALERT_TEMPLATE: 'viewport-alert.html',
  SETTING_ALERT_TEMPLATE: 'setting-alert.html'
})

.service('simulator.$helper', [
  '$prefixStyle',
  function($prefixStyle) {
    'use strict'

    this.translate = function($element, destX, destY) {
      $element.css($prefixStyle('transform'), 'translate(' + destX + 'px,' + destY + 'px)')
    }

    /**
     * findParentByClass 通过 class 名称，向上查找父节点，点到即止
     * @param  {Object} $elem  angular element
     * @param  {string} _class class 名称，因为部分浏览器 class 为关键字，因此以 _class 命名
     * @return {Object}        angular element
     */
    this.findParentByClass = function($elem, _class) {
      var $prnt

      while(1) {
        $prnt = $elem.parent();
        if ($prnt.hasClass(_class)) {
          return $prnt
        }

        if ($prnt[0] === document) {
          break
        }

        $elem = $prnt
      }
    }
  }
])

.controller('SimulatorController', [
  '$scope',
  function($scope) {
    'use strict'

    var exports = this

    $scope.isMoving = false              // viewport 控件移动，控件是否在移动撞他
    $scope.isOpenSidebar = {
      component: false,
      setting: false
    }

    exports.openSidebar = function(token, isOpen) {
      var opens = $scope.isOpenSidebar
          , oldFlag
          , newFlag

      if (opens.hasOwnProperty(token)) {
        oldFlag = opens[token]
        exports.closeSlidebar()

        newFlag = opens[token]

        if (oldFlag === newFlag) {
          opens[token] = angular.isDefined(isOpen) ? !!isOpen : !newFlag
        }
      }
    };

    exports.closeSlidebar = function() {
      var opens = $scope.isOpenSidebar

      angular.forEach(opens, function(v, sidebar) {
        opens[sidebar] = false
      })
    }

    $scope.openSidebar = function($event, token, isOpen) {
      $event && $event.stopPropagation()
      exports.openSidebar(token, isOpen)
    }
  }
])

.directive('simulator', [
  '$log',
  function($log) {
    return {
      restrict: 'A',
      controller: 'SimulatorController',
      require: '^simulator',
      link: function($scope, $element, $attrs, ctrl) {'use strict';
          // 禁止右键
        if (!angular.$debug) {
          $element[0].oncontextmenu = function() {
            return false
          }
        }
      }
    }
  }
])

.directive('simulatorBody', [
  '$rootScope', '$compile',
  function($rootScope, $compile) {
    return {
      restrict: 'A',
      require: '^simulator',
      link: function($scope, $element, $attrs, ctrl) {
        'use strict'

        $element
        .on('click', function(event) {
          $scope.$apply(function() {
            ctrl.closeSlidebar()
          })
        })

        $scope.isOpenProgress = false     // 是否开启 progress
        $scope.progress = 0               // progress 百分比

        // 全局 progress 事件声明
        $rootScope.$on('$simulator.$progress', function(event, action, param) {
          if ('open' === action) {
            $scope.isOpenProgress = true
          }
          else if ('close' === action) {
            $scope.isOpenProgress = false
          }
          else if ('toggle' === action) {
            $scope.isOpenProgress = angular.isDefined(param) ? !!param : !param
          }
          else if ('progress' === action) {
            $scope.isOpenProgress = true

            if (angular.isNumeric(param)) {
              $scope.progress = param
            }
          }
        })

        // 新建 progess
        var tpl = document.getElementById('tpls/partials/simulator/progress-cover.html').innerHTML
            , $progressCover = $compile(tpl)($scope)

        $element.append($progressCover)
        $scope.$emit('$simulator.$ready')
      }
    }
  }
])

.directive('simulatorSidebar', [
  function() {
    return {
      restrict: 'A',
      require: '^simulator',
      link: function($scope, $element, $attrs, ctrl) {
        'use strict'

        $element
        .on('click', function(event) {
          event.stopPropagation()
        })
      }
    }
  }
])

.directive('simulatorViewport', [
  'SIMULATOR_CONSTANT',
  '$compile', '$q', 'simulator.$helper',
  function(SIMULATOR_CONSTANT, $compile, $q, $fn) {
    return {
      restrict: 'A',
      require: '^simulator',
      link: function($scope, $element, $attrs, ctrl) {
        'use strict'

        var $window = angular.element(window)
            , $placeholder = (function() {
              var tplpath = SIMULATOR_CONSTANT.TEMPLATE_PATH + SIMULATOR_CONSTANT.DRAGGER_PLACEHOLDER_TEMPLATE
              , tpl = document.getElementById(tplpath).innerHTML

              return angular.element(tpl)
            })()
            , $alert = (function() {
              var tplpath = SIMULATOR_CONSTANT.TEMPLATE_PATH + SIMULATOR_CONSTANT.VIEWPORT_ALERT_TEMPLATE
              , tpl = document.getElementById(tplpath).innerHTML;

              return angular.element(tpl)
            })()

        // 阻止滚动冒泡
        $element
        .on('mousewheel', function(event) {
          var element = $element[0]
              , delta = event.wheelDelta
              , scrollTop = element.scrollTop

          if (delta > 0 && scrollTop === 0) {
            event.preventDefault()
          }
          else {
            if (delta < 0 && (scrollTop == element.scrollHeight - element.offsetHeight)) {
              event.preventDefault()
            }
          }
        })

        // Open Instance
        // =================

        var $viewport = ctrl.$viewport = {
          /**
           * isEmpty 判断 viewport 里面是否有元素
           * @return {Boolean} 返回正确与错误
           */
          isEmpty: function() {
            return '' === $element.html()
          },
          /**
           * isExists 判断 alert 是否存在
           * @return {Boolean} 存在返回 true 否则返回 false
           */
          isExists: function() {
            return !!$alert.parent()[0]
          },
          /**
           * append viewport 插入元素
           * @param  {Anything} element 插入的元素
           */
          append: function(element) {
            $element.append(element)
            $alert.remove()
          },
          /**
           * append viewport 插入元素
           * @param  {Anything} element 插入的元素
           */
          appendNode: function(templateId) {
            var tpl = document.getElementById(templateId).innerHTML
            $element.append($compile(tpl)($scope))
            $alert.remove()
          },
          /**
           * toggleAlert 开启 alert
           * @param  {Boolean} isOpen(optional) 是否开启，将以 viewport 里面是否没有任何元素来决定isOpen的值
           */
          toggleAlert: function(isOpen) {
            isOpen = angular.isDefined(isOpen) ? !!isOpen : this.isExists() || this.isEmpty()
            isOpen ? $element.append($alert) : $alert.remove()
          },
          on: function(type, handler /*, args...*/) {
            var args = Array.prototype.slice.call(arguments, 1, arguments.length)
                , fn = $viewport['on' + type.replace(/^\w/, function($1) {
                  return $1.toUpperCase()
                })]

            fn.apply($viewport, args)
            return this
          },
          off: function(type, handler /*, args...*/) {
            var args = Array.prototype.slice.call(arguments, 1, arguments.length)
                , fn = $viewport['off' + type.replace(/^\w/, function($1) {
                  return $1.toUpperCase()
                })]

            fn.apply($viewport, args)
            return this
          },
          trigger: function(type) {
            $element.triggerHandler(type)
            return this
          }
        }


        // Main
        // ===================
        $element.append($alert)
        $scope.$emit('$simulator.$viewport.$ready', $viewport)

        // ======================================================
        // 由于 angular docs 标明 do not supported event namespace
        // 因此请不要用 on('click.namespce', handler) 写法
        // ======================================================

        // Hover event defination
        !(function($viewport) {
          var enterHandler, leaveHandler;
          $viewport.onHover = function(enter, leave, event) {
            if (angular.isFunction(enter) && angular.isFunction(leave)) {
              $element
              .on('mouseenter', enterHandler = function(event) {
                enter(event, $placeholder);
              })
              .on('mouseleave', leaveHandler = function(event) {
                leave(event, $placeholder);
              })
            }
          }

          $viewport.offHover = function() {
            $element
            .off('mouseenter', enterHandler)
            .off('mouseleave', leaveHandler)
          }
        })($viewport)

        // Drag and drop event defination
        !(function($viewport) {
          var dropHandler

          $viewport.onDrop = function(handler) {
            $element.on('mousemove touchmove pointermove MSPointerMove', seizeEvent)
            $window.on('mouseup touchend pointerup MSPointerUp mousecancel touchcancel pointercancel MSPointerCancel', dropHandler = function(event) {
              handler(event, $placeholder)
              $viewport.offDrop()
            })
          }

          $viewport.offDrop = function() {
            $window.off('mouseup touchend pointerup MSPointerUp mousecancel touchcancel pointercancel MSPointerCancel', dropHandler)
            $element.off('mousemove touchmove pointermove MSPointerMove', seizeEvent)
          }
        })($viewport)

        // 插入并选择 "位置"
        function seizeEvent(event) {
          var tar = event.target
              , $tar = angular.element(tar)
              , $prnt = $fn.findParentByClass($tar, SIMULATOR_CONSTANT.FRAME_NAME)

          if ($prnt) {
            $tar = $prnt
            tar = $tar[0]
          }

          var prnt = tar.offsetParent
          if (!tar.offsetParent) {
            return
          }

          var py = event.offsetY
              , cy = tar.clientTop + prnt.clientTop
              , ch = tar.clientHeight

          $tar.hasClass(SIMULATOR_CONSTANT.FRAME_NAME) || $tar.hasClass(SIMULATOR_CONSTANT.PLACEHOLDER_NAME)
          ? py < cy + ch/2
            ? tar.parentNode.insertBefore($placeholder[0], tar)
            : tar.parentNode.insertBefore($placeholder[0], tar.nextSibling)
          : angular.element(this).append($placeholder)
        }
      }
    };
  }
])

.directive('simulatorSetting', [
  'SIMULATOR_CONSTANT',
  '$compile',
  function(SIMULATOR_CONSTANT, $compile) {
    return {
      restrict: 'A',
      require: '^simulator',
      link: function($scope, $element, $attrs, ctrl) {
        'use strict'

        var $alert = (function() {
              var tplpath = SIMULATOR_CONSTANT.TEMPLATE_PATH + SIMULATOR_CONSTANT.SETTING_ALERT_TEMPLATE
              , tpl = document.getElementById(tplpath).innerHTML

              return angular.element(tpl)
            })()

        // Open Interface
        // =================

        var $setting = ctrl.$setting = {
          /**
           * isEmpty 判断 viewport 里面是否有元素
           * @return {Boolean} 返回正确与错误
           */
          isEmpty: function() {
            return '' === $element.html()
          },
          /**
           * isExists 判断 alert 是否存在
           * @return {Boolean} 存在返回 true 否则返回 false
           */
          isExists: function() {
            return !!$alert.parent()[0]
          },
          /**
           * append viewport 插入元素
           * @param  {Anything} element 插入的元素
           */
          append: function(element) {
            $element.append(element)
            $alert.remove()
          },
          /**
           * toggleAlert 开启 alert
           * @param  {Boolean} isOpen(optional) 是否开启，将以 viewport 里面是否没有任何元素来决定isOpen的值
           */
          toggleAlert: function(isOpen) {
            isOpen = angular.isDefined(isOpen) ? !!isOpen : this.isExists() || this.isEmpty()
            isOpen ? $element.append($alert) : $alert.remove()
          },
          render: function(tplId, scope) {
            var tpl = document.getElementById(tplId).innerHTML
            $element.html('').append($compile(tpl)(scope))
            angular.element(window).triggerHandler('resize')
          },
          remove: function() {
            $element.html('')
          }
        }

        $setting.toggleAlert()
      }
    }
  }
])

.directive('simulatorDragger', [
  'SIMULATOR_CONSTANT',
  '$compile', 'simulator.$helper',
  function(SIMULATOR_CONSTANT, $compile, $fn) {
    return {
      restrict: 'A',
      require: '^simulator',
      link: function($scope, $element, $attrs, ctrl) {
        'use strict'

        var $window = angular.element(window)
            , isDraging;

        /**
         * 逻辑流程：
         * 1. 按下鼠标 -》 绑定 window 鼠标移动事件 -》 当鼠标弹起时，则结束拖拽操作
         * 拖拽期间当结束时，执行插入
         * 2. 绑定 viewport hover 事件，当判断到在拖拽情况下且当前鼠标已经移入 viewport
         * 中并弹起时，插入控件
         */
        $element
        .on('mousedown touchstart pointerdown MSPointerDown', function(event) {
          event.stopPropagation()

          // 制作克隆节点
          var $viewport = ctrl.$viewport
              , $clone = (function() {
                var tpl = document.getElementById(SIMULATOR_CONSTANT.TEMPLATE_PATH + SIMULATOR_CONSTANT.DRAGGER_SHADOW_TEMPLATE).innerHTML
                return angular.element(tpl);
              })()
              .append($element.clone())
              .css({ position: 'absolute', left: 0, top: 0 });

          angular.element(document.body)
          .addClass(SIMULATOR_CONSTANT.DRAGGER_LOCK_CLASS)
          .append($clone)

          isDraging = true

          // 拉拽控件移动方法定义
          var moveHandler
              , endHandler

          // Drag and drop handler defination
          // 绑定 Viewport 在拖拽中移入窗口的事件
          var isBinded = false

          $viewport.on('hover', function(event) {
            if (false === isBinded && true === isDraging) {
              isBinded = true
              $viewport.toggleAlert(false)

              $viewport.on('drop', function(event, $placeholder) {
                var isExistsPH = !!$placeholder.parent()[0]

                // 插入控件
                if (isExistsPH) {
                  var tpl = document.getElementById($attrs.template).innerHTML
                      , $component = $compile(tpl)($scope)

                  $placeholder.replaceWith($component)
                }

                $placeholder.remove()
                $viewport.off('hover')
                $viewport.toggleAlert()
                isBinded = false
              })
            }
          },
          function(event, $placeholder) {
            $viewport.off('drop')
            $placeholder.remove()
            $viewport.toggleAlert()
            isBinded = false
          })

          // 绑定拖拽事件
          $window
          .on('mousemove touchmove pointermove MSPointerMove', moveHandler = function(event) {
            var el = $clone[0]
                , ch = el.clientHeight
                , cw = el.clientWidth
                , touch = event.touches ? event.touches[0] : { clientX: event.pageX, clientY: event.pageY }
                , x = touch.clientX
                , y = touch.clientY

            $fn.translate($clone, x - cw/2, y - ch/2)

            $scope.$apply(function() {
              ctrl.closeSlidebar()
            })
          })
          // 最终结束事件
          .on('mouseup touchend pointerup MSPointerUp mousecancel touchcancel pointercancel MSPointerCancel', endHandler = function() {
            isDraging = false
            $clone.remove()
            $viewport.toggleAlert()

            $window
            .off('mousemove touchmove pointermove MSPointerMove', moveHandler)
            .off('mouseup touchend pointerup MSPointerUp mousecancel touchcancel pointercancel MSPointerCancel', endHandler)

            $viewport.off('hover')
            $viewport.off('drop')

            angular.element(document.body)
            .removeClass(SIMULATOR_CONSTANT.DRAGGER_LOCK_CLASS)
          })
        });
      }
    };
  }
])

.directive('simulatorBox', [
  'SIMULATOR_CONSTANT',
  '$rootScope', '$q', 'simulator.$helper',
  function(SIMULATOR_CONSTANT, $rootScope, $q, $fn) {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'tpls/partials/simulator/dropper.html',
      require: '^?simulator',
      link: function($scope, $element, $attrs, ctrl) {
        'use strict'

        // 此处 $scope 并非上面的 viewport 的 $scope
        // 而是外部控件控制器的 $scope，因此可以直接传递给 `setting` 渲染出来

        $scope.isLock = true
        $scope.toggle = function($event, isLock) {
          $event && $event.stopPropagation()
          $scope.isLock = angular.isDefined(isLock) ? !!isLock : !$scope.isLock
        }

        $scope.modify = function($event) {
          $event && $event.stopPropagation()
          ctrl.openSidebar('setting')

          var tplpath = SIMULATOR_CONSTANT.TEMPLATE_PATH + $attrs.template
          ctrl.$setting.render(tplpath, $scope)
        }

        $scope.close = function($event) {
          $event && $event.stopPropagation()

          if (angular.isFunction($scope.$closeConfirm)) {
            $scope.$closeConfirm({ resolve: close })
          }
          else if (confirm('你确定要删除该组件')) {
            close()
          }
        }

        function close(){
          $fn.findParentByClass($element, 'node-frame').remove()
          ctrl.$setting.remove()
          ctrl.$setting.toggleAlert()
        }
      }
    }
  }
])

.directive('simulatorNode', [
  'SIMULATOR_CONSTANT',
  'simulator.$helper',
  function(SIMULATOR_CONSTANT, $fn) {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'tpls/partials/simulator/node.html',
      require: '^simulator',
      link: function($scope, $element, $attrs, ctrl) {
        'use strict'

        var $window = angular.element(window);

        $element
        .on('mousedown', function(event) {
          event.stopPropagation()

          var $viewport = ctrl.$viewport
              , $shadow = (function () {
                var tplName = SIMULATOR_CONSTANT.TEMPLATE_PATH + SIMULATOR_CONSTANT.DRAGGER_PLACEHOLDER_TEMPLATE
                , tpl = document.getElementById(tplName).innerHTML

                return angular.element(tpl)
              })()
              .css({ position: 'absolute', left: 0, top: 0 })

          $viewport.toggleAlert()
          angular.element(document.body).append($shadow)

          // 拉拽控件移动方法定义
          var moveHandler, endHandler

          $window
          .on('mousemove touchmove pointermove MSPointerMove', moveHandler = function(event) {
            var el = $shadow[0]
                , ch = el.clientHeight
                , cw = el.clientWidth

            $fn.translate($shadow, event.pageX - cw/2, event.pageY - ch/2)
          })
          .on('mouseup touchend pointerup MSPointerUp mousecancel touchcancel pointercancel MSPointerCancel', endHandler = function() {
            $shadow.remove()
            $viewport.off('hover')

            $window
            .off('mousemove touchmove pointermove MSPointerMove', moveHandler)
            .off('mouseup touchend pointerup MSPointerUp mousecancel touchcancel pointercancel MSPointerCancel', endHandler)
          });

          // 绑定拉拽交换位置事件
          var isBinded = false

          $viewport.on('hover', function() {
            $element.css('display', 'none')

            if (false === isBinded) {
              isBinded = true

              $viewport.on('drop', function(event, $placeholder) {
                // 判断 placeholder 是否存在于 viewport 内
                var isExistsPH = !!$placeholder.parent()[0]
                isExistsPH && $placeholder.replaceWith($element)
                $element.css('display', 'block')
                isExistsPH && $placeholder.remove()
                $shadow.remove()
                $viewport.off('hover')
                isBinded = false
              })
            }
          },
          function(event, $placeholder) {
            $element.css('display', 'block')
            $placeholder.remove()

            $viewport.off('drop')
            $viewport.toggleAlert()
            isBinded = false
          }, event)

          // triggerHandler 会导致冒泡失败，ng-click 等事件不会进入冒泡
          setTimeout(function() {
            $viewport.trigger('mouseenter')
          },10)
        })
      }
    }
  }
])
