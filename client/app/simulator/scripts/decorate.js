/**
 *  @name Decorate
 *  @author <David Jones qowera@qq.com>
 *  @description
 *  
 *  拖拽控件可看 partials/simulator.js
 *  因为与前台组件库保持一致，因此要引入 iframe 来展示控件
 */
angular.module('decorate', [
  'ngRoute'
  , 'simulator'
])

// 控件类型与是否开放, true 为开放, false 为不开放
.constant('COMPONENT_TYPES', {
  SLIDER: true
  , FN: false
  , GOODS: false
  , PIC1: false
  , PIC2: false
  , TOPIC: false
  , AD: false
  , HOME: false
  , LINE: false
})

// 组件模板
.constant('COMPONENTS_TEMPLATE', 'tpls/partials/simulator/components.html')

// 设置路由
.config([
  'PATH_CONSTANTS', '$routeProvider',
  function(PATH_CONSTANTS, $routeProvider) {
    'use strict'

    var oldDomain = document.domain

    $routeProvider
    .when('/index/decorate/:page/', {
      templateUrl: PATH_CONSTANTS.TEMPLATE_PATH + '/decorate.html',
      controller: 'Decorate.IndexController',
      resolve: {
        merchantId: [
          '$q', 'sysModel',
          function($q, sysModel) {
            var deferred = $q.defer();

            sysModel.get()
            .then(function(data) {
              deferred.resolve(data.merchant_id);  
            });

            return deferred.promise;
          }
        ],
        originDomain: [
          '$q',
          function($q) {
            var deferred = $q.defer(),
                originDomain = window.document.domain,
                mainDomain = window.document.domain.match(/[\w]+\.[\w]+$/);

            // 设置主域名
            window.document.domain = mainDomain[0];
            deferred.resolve(originDomain);
            return deferred.promise;
          }
        ]
      }
    })
  }
])

.service('decorateService', [
  function() {
    'use strict'

    var exports = this
        , resizeHandles = [];

    exports.onResized = function(nodeWindow, handle) {
      resizeHandles.push({
        window: nodeWindow,
        callback: handle
      })
    }

    angular.element(window)
    .on('resize', function() {
      var i = 0
          , len = resizeHandles.length
          , handle

      // 删除已删除的 window 绑定的方法
      for (; i < len; i ++) {
        handle = resizeHandles[i]
        angular.isEmptyObject(handle.window)
        ? resizeHandles.splice(i --, 1) && len --
        : handle.callback()
      }
    })
  }
])

.controller('Decorate.IndexController', [
  'COMPONENT_TYPES', 'COMPONENTS_TEMPLATE',
  '$rootScope', '$scope', '$compile',
  'decorationModel', 'merchantId', 'originDomain',
  function(COMPONENT_TYPES, COMPONENTS_TEMPLATE, $rootScope, $scope, $compile, decorationModel, merchantId, originDomain) {'use strict';
    $scope.$instance = {}
    $scope.COMPONENT_TYPES = COMPONENT_TYPES
    $scope.merchantId = merchantId

    $scope.leftSideBarOpened = false        // 开启左侧工具栏
    $scope.rightSideBarOpened = false       // 开启右侧工具栏

    // 开启左侧栏
    $scope.toggleLeftSidebar = function() {
      $scope.leftSideBarOpened = !$scope.leftSideBarOpened
    }

    // 开启右侧栏
    $scope.toggleRightSidebar = function() {
      $scope.rightSideBarOpened = !$scope.rightSideBarOpened
    }

    // Reset Domain
    $scope.$on('$routeChangeStart', function(next, current) {
      window.document.domain = originDomain
    })

    // viewport 准备就绪
    $scope.$on('$simulator.$viewport.$ready', function(event, $viewport) {
      decorationModel.list({ page_id: 1 })
      .then(function(nodeList) {
        var max = nodeList.length
            , led = 0;

        angular.forEach(nodeList, function(node) {
          var type = node.type.toUpperCase()

          // 生成控件
          if (type && COMPONENT_TYPES[type]) {
            var tpl = document.getElementById(COMPONENTS_TEMPLATE).innerHTML
                , tplFn = $compile(tpl)
                , $newScope = $scope.$new(true);

            angular.extend($newScope, node)

            // 因为内部有多层 scope 因此直接绑定广播事件
            $newScope.$on('$simulator.$viewport.$node.$init', function(event, callback) {
              callback(node)
            })

            $viewport.append(tplFn($newScope))
          }
        })
      })
      .catch(function(msg) {
        $rootScope.$broadcast('notify', msg, 'error')
      })
    })

    // 复制链接
    $scope.successCopyLink = function() {
      $rootScope.$broadcast('notify', '已经成功复制商品地址', 'success')
    }

    $scope.failCopyLink = function() {
      $rootScope.$broadcast('notify', '复制商品地址失败', 'success')
    }
  }
])

// 控件配置
// ========================

.factory('decorate.$Midware', [
  'PATH_CONSTANTS',
  function(PATH_CONSTANTS) {
    'use strict'

    var $Midware = function(type, data) {
      this.$instance = null
      this.$type = type
      this.$data = $.extend({}, data)
      this.$readyListeners = []
    }

    $Midware.prototype.$set = function($instance) {
      if (angular.isWindow($instance) && angular.isFunction($instance.instance)) {
        this.$instance = $instance
      }
    }

    $Midware.prototype.$get = function() {
      return this.$instance
    }

    $Midware.prototype.onReady = function(callback) {
      angular.isArray(this.$readyListeners)
      ? angular.isFunction(callback) && this.$readyListeners.push(callback)
      : callback.call(this, this)
    }

    $Midware.prototype.ready = function() {
      var self = this

      angular.forEach(this.$readyListeners, function(handler) {
        handler.call(self, self)
      })

      this.$readyListeners = undefined;
    }

    $Midware.prototype.instance = function() {
      var $instance = this.$instance
      $instance.instance.apply($instance, arguments)
    }

    $Midware.prototype.setItem = function(name, value) {
      this.$data[name] = value
      return value
    }

    $Midware.prototype.getItem = function(name) {
      return name ? this.$data[name] : this.$data
    }

    return $Midware
  }
])

/**
 * decorateNodeFrame
 * Iframe 专属，所有node都建立在此`指令`上，
 * 该指令主要用于建立 controller 与 iframe contentWindow 之间的的链接
 * 通过该指令能使 controller 获得 $instance 接口
 * 因此配置 controller 的时候必须设置 $instance = { $api: {},... }，否则程序将报 $instance 引入错误
 * 若不在需要使用 iframe，此指令可以免去
 */
.directive('decorateNodeFrame', [
  'decorateService',
  function(service) {
    return {
      scope: {
        $midware: '=ngModel'
      },
      link: function($scope, $element, $attrs) {
        'use strict'

        var $window = angular.element(window)
            , $midware = $scope.$midware;

        $element
        .on('load', function() {
          var $instance = $element[0].contentWindow
          $midware.$set($instance)

          service.onResized($instance, function() {
            var size = $instance.getSize()
            $element.css({ height: size.height + 'px' })
          })

          $midware.instance(function(node) {
            node.render($midware.getItem())
            .then(function() {
              $window.triggerHandler('resize')
            })
          })

          $midware.ready()
        })
        .attr('src', $midware.getItem('previewSrc'))
      }
    }
  }
])

/**
 * ==============================================================================
 * 以下所有 controllers 均为业务逻辑控制器，开发者无需考虑拖拽效果与配置显示等，你可以通过这里
 * 添加 controller 达到添加/配置控件目的，当然不要忘记添加相应的配置模板和控件模板
 * 
 * * 若基础框架错误或系统发生部分错误或需要优化流程，可参考/修改 partials 下的 simulator.js
 * * 上面 iframe `指令` 调度API与框架程序无任何关系
 *
 * 
 * $closeConfirm 接口
 * ------------------
 * 
 * 可以添加 $closeConfirm 方法调用 simulator-box 指令的删除函数，当点击删除时，可以通过返回
 * Promise 控制是否进行下一步操作，此时可以通过 AJAX 等进行验证和可以自定义 confirm 文字
 *
 * @example
 * 
 * 当点击删除按钮，弹出 confirm 并提示是否确定要进行此操作
 * 当点击是，则请求 AJAX，若AJAX 返回正确则删除组件
 * 
 * $scope.$closeConfirm = function(promise) {
 *   if (confirm('你确认要删除此组件')) {
 *     myAjax...
 *     .then(function() {
 *       promise.resolve();
 *     });
 *   }
 * };
 *
 * 
 * 通信 $scope.$emit('$simulator.$viewport.$node.$ready')
 * ---------------------------------------------------------
 *
 * 当生成完某组件后，可以执行广播达到，初始化赋值，从上面 IndexController 已经定义一个广播接
 * 收事件，其名字叫 $simulator.$viewport.$node.$ready 以达到上下通信效果
 * 因为 Controller 与生成组件的 scope 之间可能存在N个 Controller，因此要通信最好的方法就是
 * 直接向上广播，当 IndexController 接收到该事件，则配置新的组件。
 * 
 * ==============================================================================
 */

// 焦点图
.controller('Decorate.CarouselController', [
  'PATH_CONSTANTS',
  '$rootScope', '$scope', '$upload', 'decorate.$Midware',
  'decorationModel',
  function(PATH_CONSTANTS, $rootScope, $scope, $upload, $Midware, decorationModel) {
    'use strict'

    var $midware = $scope.$midware = new $Midware('carousel')       // 中间层

    // Preivew
    $scope.id                                                       // 控件ID
    $scope.settingTpl = 'carousel-setting.html'                     // 设置模板
    $scope.previewSlide = {}                                        // 预览图片
    $scope.isOpenUpload = false                                     // 是否开启上传图片
    $scope.slides = []                                              // 滑块图片

    // 与 iframe 交互数据
    $midware.setItem('slides', $scope.slides)
    $midware.setItem('previewSrc', PATH_CONSTANTS.MOBILE_PATH + '/previewComponents/?node=carousel')

    // 指令 simulatorBox 将调用此方法
    $scope.$closeConfirm = function(promise) {
      if (confirm('你确定要删除该组件？')) {
        decorationModel.del($scope.id)
        .then(function() {
          $rootScope.$broadcast('notify', '成功删除', 'success')
          promise.resolve()
        })
      }
    }

    // 开启上传工具
    $scope.toggleUpload = function(isOpen) {
      arguments.length > 0
      ? $scope.isOpenUpload = !!isOpen
      : $scope.isOpenUpload = !$scope.isOpenUpload

      angular.element(window).triggerHandler('resize')
    }

    // 删除图片
    $scope.del = function(index) {
      if (confirm('你确定要删除该图片？')) {
        $scope.slides.splice(index, 1)
        syncData()
        $scope.redraw()
      }
    }

    // 上传图片
    $scope.uploadImages = function(files) {
      if (angular.isArray(files) && files.length > 0) {
        $upload.upload({
          url: PATH_CONSTANTS.API_PATH + '/image/upload_wmall/',
          data: files,
          withCredentials: true
        })
        .progress(function(event) {
          var progress = Math.min(100, parseInt(100.0 * event.loaded / event.total))
          $rootScope.$broadcast('$simulator.$progress', 'progress', progress)
        })
        .success(function(res) {
          $rootScope.$broadcast('$simulator.$progress', 'progress', 'close')

          var data = res.data
          $scope.previewSlide = {
            image: data.pic_name,
            size: data.size,
            width: data.image_width,
            height: data.image_height
          }

          0 === res.code
          ? $scope.toggleUpload(true)
          : $rootScope.$broadcast('notify', res.msg, 'error')
        })
        .finally(function() {
          $rootScope.$broadcast('$simulator.$progress', 'close')          
        })
      }
    }

    // 提交
    $scope.addItem = function() {
      var slide = $scope.previewSlide
          , imageSrc = slide.image;

      if (imageSrc) {
        if (!slide.linkType) {
          $rootScope.$broadcast('notify', '请选择跳转模式', 'error')
          return
        }

        if (slide.linkType == 1 && !slide.action) {
          $rootScope.$broadcast('notify', '请选择跳转的功能模块', 'error')
          return
        }

        if (slide.linkType == 2 && !slide.link) {
          $rootScope.$broadcast('notify', '请输入需要跳转的链接', 'error')
          return
        }

        if (angular.isString(imageSrc) && imageSrc !== '') {
          var slides = $scope.slides

          slides.push({
            image: imageSrc,
            linkType: slide.linkType,
            link: slide.link || '',
            action: slide.action || '',
            active: false
          })

          syncData()
          $midware.setItem('slides', slides)
          $scope.redraw()
        }
      }
      else {
        $rootScope.$broadcast('notify', '系统没有接受到你的图片，请重新再上传', 'error')
      }

      $scope.toggleUpload(false)
      $scope.previewSlide = {}
    }

    // 重画/刷新
    $scope.redraw = function() {
      $midware.instance(function(node) {
        node.redraw($midware.getItem() || {})
        .then(function() {
          angular.element(window).triggerHandler('resize')
        })
      })
    }

    // 图片上传
    $scope.$watch('imageFiles', $scope.uploadImages)

    // 检测到修改立马同步
    var count = 0;
    $scope.$watch('slides', function(newValue, oldValue) {
      count ++ > 0 && syncData()
    }, true)

    // 向父级广播获取数据进行渲染，若不是初始化已有数据，该广播无效
    $scope.$emit('$simulator.$viewport.$node.$init', function(node) {
      $scope.id = node.id
      $scope.slides = node.setting && angular.isArray(node.setting.slides) ? node.setting.slides : []
      $midware.setItem('slides', $scope.slides)
    });

    $midware.onReady(function() {
      $scope.$emit('$simulator.$viewport.$node.$ready')
    });

    // 若ID不存在，则该组件是一个新组件
    if (!$scope.id) {
      decorationModel.add({ page_id: 1, type: 'slider' })
      .then(function(id) {
        $scope.id = id
      })
      .catch(function() {
        $rootScope.$broadcast('notify', '系统创建组件出错，请刷新再进行操作', 'error')
      })
    }


    // Helpers
    // ================

    // 数据同步
    function syncData() {
      var home = PATH_CONSTANTS.MOBILE_PATH
          , path = {
            1: home,
            2: home + '/list/'
          }

      decorationModel.edit($scope.id, {
        slides: angular.copy($scope.slides)
        .map(function(slide) {
          if (1 == slide.action) {
            slide.link = path[slide.linkType]
          }

          return slide
        })
      })
      .catch(function() {
        $rootScope.$broadcast('notify', '数据同步出错，请刷新再进行操作', 'error')
      })
    }
  }
])

// 功能菜单
.controller('Decorate.FuncnavController', [
  '$scope', 'decorate.$Midware',
  function($scope, $Midware) {
    'use strict'
    
    var $midware = $scope.$midware = new $Midware('funcnav')      // 中间层
  }
])

// 商品模块
.controller('Decorate.ListController', [
  '$scope', 'decorate.$Midware',
  function($scope) {
    'use strict'

    var $midware = $scope.$midware = new $Midware('list');      // 中间层

  }
])

// 大图模块
.controller('Decorate.PhotoesController', [
  '$scope',
  function($scope) {
    'use strict'

  }
])

.controller('Decorate.TopicController', [
  '$scope',
  function($scope) {
    'use strict'

  }
])

.controller('Decorate.AdController', [
  '$scope',
  function($scope) {
    'use strict'

  }
])

.controller('Decorate.HomeController', [
  '$scope',
  function($scope) {
    'use strict'

  }
])

.controller('Decorate.SplitController', [
  '$scope',
  function($scope) {
    'use strict'

  }
])