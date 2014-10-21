

angular.module('chat', [])

.directive('chatLayout', [
  '$rootScope',
  function($rootScope) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        function open() {
          angular.element(document.body).addClass('show-chat');
        }

        function close() {
          angular.element(document.body).removeClass('show-chat');
        }

        $rootScope.$on('layout.toggle.chat', function(event, isOpen) {
          $scope.isOpen = arguments.length > 1 ? !!isOpen : !$scope.isOpen;
          $scope.isOpen ? open() : close();
        });

        $scope.isOpen = !!$attrs.open;
        $scope.isOpen ? open() : close();
      }
    };
  }
])

.controller('Chat', [
  '$scope',
  function($scope) {'use strict';
    $scope.isOpenBox = false;

    $scope.openBox = function() {
      $scope.isOpenBox = true;
    };

    $scope.closeBox = function() {
      $scope.isOpenBox = false;
    };

    $scope.toggleBox = function() {
      $scope.isOpenBox = !$scope.isOpenBox;
    };
  }
])

.controller('ChatBox', [
  '$scope',
  function($scope) {'use strict';

  }
]);

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
]);

angular.module('navigation', [])

.directive('navLayout', [
  '$rootScope',
  function($rootScope) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attrs, ctrl) {'use strict';
        function open() {
          $element.removeClass('minify');
          angular.element(document.body).addClass('show-nav');
        }

        function close() {
          $element.addClass('minify');
          angular.element(document.body).removeClass('show-nav');
        }

        $rootScope.$on('layout.toggle.navigation', function(event, isOpen) {
          $scope.isOpen = arguments.length > 1 ? !!isOpen : !$scope.isOpen;
          $scope.isOpen ? open() : close();
        });

        $scope.isOpen = !!$attrs.open;
        $scope.isOpen ? open() : close();
      }
    };
  }
])

.controller('Navigation', [
  '$scope', '$http', '$route', '$location',
  'NAVIGATION',
  function($scope, $http, $route, $location, NAVIGATION) {
    var exports = this;

    $scope.navigations = NAVIGATION;
    $scope.current = '';
    $scope.filter = '';

    exports.reload = function() {
      var i = 0,
      paths = $location.$$path.replace(/^\//, '').replace(/\/$/, '').split('\/'),
      index;

      for (; i < $scope.navigations.length; i ++) {
        index = angular.inArrayBy(paths[1] || paths[0], $scope.navigations[i].child || [], 'key');
        if (-1 !== index) {
          $scope.current = [$scope.navigations[i].key, paths[1] || paths[0]];
          break;
        }
      }
    };

    exports.filter = function(str) {
      var regexp = new RegExp(str, 'ig');

      angular.forEach($scope.navigations, function(nav) {
        if (angular.isArray(nav.child)) {
          nav.hidden = true;
          nav.open = false;

          angular.forEach(nav.child, function(item) {
            if (!item.name.match(regexp)) item.hidden = true;
            else {
              nav.open = true;
              nav.hidden = item.hidden = false;
            }
          });
        }
        else nav.hidden = !nav.name.match(regexp);
      });
    };

    $scope.$watch('filter', function(filter) {
      exports.filter(filter)
    });
    
    $scope.$on('$routeChangeSuccess', exports.reload);
    exports.reload();
  }
]);

angular.module('charts', [
  'highcharts-ng'
])

.controller('AreaDemoChart', [
  '$scope',
  function($scope) {
    $scope.chartConfig = {
      "options": {
        "chart": {
          "type": "areaspline"
        },
        "plotOptions": {
          "series": {
            "stacking": ""
          }
        }
      },
      "series": [{
        "data": [9, 19, 10, 8, 19, 19, 15, 17, 14, 2],
        "id": "series-4",
        "type": "area"
      }],
      "title": {
        "text": "Area"
      },
      "credits": {
        "enabled": true
      },
      "loading": false,
      "size": {}
    };
  }
])

.controller('LineDemoChart', [
  '$scope',
  function($scope) {
    $scope.chartConfig = {
      "options": {
        "chart": {
          "type": "areaspline"
        },
        "plotOptions": {
          "series": {
            "stacking": ""
          }
        }
      },
      "series": [{
        "data": [9, 19, 10, 8, 19, 19, 15, 17, 14, 2],
        "id": "series-4",
        "type": "line"
      }],
      "title": {
        "text": "Line"
      },
      "credits": {
        "enabled": true
      },
      "loading": false,
      "size": {}
    };
  }
])

.controller('BarDemoChart', [
  '$scope',
  function($scope) {
    $scope.chartConfig = {
      "options": {
        "chart": {
          "type": "bar"
        },
        "plotOptions": {
          "series": {
            "stacking": ""
          }
        }
      },
      "series": [{
        "data": [9, 19, 10, 8, 19, 19, 15, 17, 14, 2],
        "id": "series-4",
        "type": "area"
      }],
      "title": {
        "text": "Bar"
      },
      "credits": {
        "enabled": true
      },
      "loading": false,
      "size": {}
    }
  }
])

.controller('ColumnDemoChart', [
  '$scope',
  function($scope) {
    $scope.chartConfig = {
      "options": {
        "chart": {
          "type": "column"
        },
        "plotOptions": {
          "series": {
            "stacking": ""
          }
        }
      },
      "series": [{
        "name": "Some data",
        "data": [1, 2, 4, 7, 3, 1, 10, 20, 1, 10, 20],
        "id": "series-0",
        "type": "scatter"
      }],
      "title": {
        "text": "Column"
      },
      "credits": {
        "enabled": true
      },
      "loading": false,
      "size": {}
    };
  }
])

.controller('PieDemoChart', [
  '$scope',
  function($scope) {
    $scope.chartConfig = {
      "options": {
        "chart": {
          "type": "areaspline"
        },
        "plotOptions": {
          "series": {
            "stacking": "normal"
          }
        }
      },
      "series": [{
        "name": "Some data",
        "data": [1, 2, 4, 7, 3],
        "id": "series-0",
        "type": "pie"
      }],
      "title": {
        "text": "Hello"
      },
      "credits": {
        "enabled": true
      },
      "loading": false,
      "size": {}
    };
  }
])

.controller('ScatterDemoChart', [
  '$scope',
  function($scope) {
    $scope.chartConfig = {
      "options": {
        "chart": {
          "type": "column"
        },
        "plotOptions": {
          "series": {
            "stacking": ""
          }
        }
      },
      "series": [{
        "name": "Some data",
        "data": [1, 2, 4, 7, 3, 1, 10, 20, 1, 10, 20],
        "id": "series-0",
        "type": "scatter"
      }],
      "title": {
        "text": "Scatter"
      },
      "credits": {
        "enabled": true
      },
      "loading": false,
      "size": {}
    };
  }
])
;

angular.module('index', [
  'ngRoute',
  'ui.ngAdmin',
  'chat', 'header', 'navigation',
  'charts'
])

.constant('TEMPLATE_PATH', './templates/')

.constant('NAVIGATION', [
  {
    name: 'Dashboard', key: 'dashboard', icon: 'dashboard'
  },
  {
    name: 'Layout', key: 'layout', icon: 'th',
    child: []
  },
  {
    name: 'Basic UI Elements', key: 'base-ui-element', icon: 'smile-o',
    child: [
      { name: 'Colors', key: 'colors' },
      { name: 'Badges & Label', key: 'badges-label' },
      { name: 'Buttons', key: 'buttons' },
      { name: 'Typography', key: 'typography' },
      { name: 'Blockquotes', key: 'blockquotes' },
      { name: 'Alerts', key: 'alert' },
      { name: 'Pagination', key: 'pagination' },
      { name: 'Navbars', key: 'navbars' },
      { name: 'Breadcrumbs', key: 'breadcrumbs' }
    ]
  },
  {
    name: 'Advanced UI Elements', key: 'advanced-ui-element', icon: 'puzzle-piece',
    child: [
      { name: 'Tiles', key: 'tiles' },
      { name: 'Panels', key: 'panels' },
      { name: 'Tabs & Accordions', key: 'tabs-accordions' },
      { name: 'Tooltips & Popovers', key: 'tooltips-popovers' },
      { name: 'Progress Bars', key: 'progress-bar' },
      { name: 'Modals', key: 'modals' },
      { name: 'Carousel', key: 'carousel' },
      { name: 'ngScroll', key: 'ngScroll' }
    ]
  },
  {
    name: 'Forms', key: 'forms', icon: 'list-alt',
    child: [
      { name: 'Basic', key: 'form-basic' },
      { name: 'Advanced', key: 'form-advanced' },
      { name: 'Wizard', key: 'form-wizard' },
      { name: 'Input Mask', key: 'form-input-mask' },
      { name: 'Multi Upload', key: 'form-multi-upload' },
      { name: 'Slider', key: 'slide' },
    ]
  },
  {
    name: 'Tables', key: 'tables', icon: 'table',
    child: [
      { name: 'Basic Table', key: 'basic-table' },
      { name: 'Data Table', key: 'data-table' }
    ]
  },
  {
    name: 'Mail', key: 'mail', icon: 'envelope',
    child: [
      { name: 'Inbox', key: 'inbox' },
      { name: 'Compose Mail', key: 'compose-mail' }
    ]
  },
  { name: 'Charts', key: 'charts', icon: 'bar-chart-o' },
  {
    name: 'Pages', key: 'tables', icon: 'folder-open-o',
    child: [
      { name: 'Frontend', key: 'front-end', url: './front-end.html', target: '_self' },
      { name: 'Welcome', key: 'welcome', url: './welcome.html', target: '_self' },
      { name: '404', key: '404', url: './404.html', target: '_self' }
    ]
  },
  {
    name: 'Demo', key: 'tables', icon: 'laptop',
    child: [
      { name: 'Role', key: 'role' },
      { name: 'User', key: 'user' },
      { name: 'Delivery', key: 'delivery' }
    ]
  },
  { name: 'Thanks For', key: 'thanks', icon: 'share' }
])

.config([
  '$routeProvider', '$locationProvider',
  'TEMPLATE_PATH',
  function($routeProvider, $locationProvider, TEMPLATE_PATH) {

    var resolve = {
      checkin: [
        '$q',
        function($q) {
          var deferred = $q.defer();
          deferred.resolve();
          return deferred.promise;
        }
      ]
    };

    $routeProvider
    .when('/',                             { templateUrl: TEMPLATE_PATH + 'index/dashboard.html', resolve: resolve })
    .when('/index/',                       { templateUrl: TEMPLATE_PATH + 'index/dashboard.html', resolve: resolve })
    .when('/index/dashboard/',             { templateUrl: TEMPLATE_PATH + 'index/dashboard.html', resolve: resolve })

    .when('/index/colors/',                { templateUrl: TEMPLATE_PATH + 'index/colors.html', resolve: resolve })
    .when('/index/buttons/',               { templateUrl: TEMPLATE_PATH + 'index/buttons.html', resolve: resolve })
    .when('/index/typography/',            { templateUrl: TEMPLATE_PATH + 'index/typography.html', resolve: resolve })
    .when('/index/badges-label/',          { templateUrl: TEMPLATE_PATH + 'index/badges-label.html', resolve: resolve })
    .when('/index/blockquotes/',           { templateUrl: TEMPLATE_PATH + 'index/blockquotes.html', resolve: resolve })
    .when('/index/alert/',                 { templateUrl: TEMPLATE_PATH + 'index/alert.html', resolve: resolve })
    .when('/index/navbars/',               { templateUrl: TEMPLATE_PATH + 'index/navbars.html', resolve: resolve })
    .when('/index/pagination/',            { templateUrl: TEMPLATE_PATH + 'index/pagination.html', resolve: resolve })
    .when('/index/breadcrumbs/',           { templateUrl: TEMPLATE_PATH + 'index/breadcrumbs.html', resolve: resolve })

    .when('/index/tiles/',                 { templateUrl: TEMPLATE_PATH + 'index/tiles.html', resolve: resolve })
    .when('/index/panels/',                { templateUrl: TEMPLATE_PATH + 'index/panels.html', resolve: resolve })
    .when('/index/tabs-accordions/',       { templateUrl: TEMPLATE_PATH + 'index/tabs-accordions.html', resolve: resolve })
    .when('/index/tooltips-popovers/',     { templateUrl: TEMPLATE_PATH + 'index/tooltips-popovers.html', resolve: resolve })
    .when('/index/progress-bar/',          { templateUrl: TEMPLATE_PATH + 'index/progress-bar.html', resolve: resolve })
    .when('/index/modals/',                { templateUrl: TEMPLATE_PATH + 'index/modals.html', resolve: resolve })
    .when('/index/slide/',                 { templateUrl: TEMPLATE_PATH + 'index/slide.html', resolve: resolve })
    .when('/index/carousel/',              { templateUrl: TEMPLATE_PATH + 'index/carousel.html', resolve: resolve })
    .when('/index/ngScroll/',              { templateUrl: TEMPLATE_PATH + 'index/ngScroll.html', resolve: resolve })

    .when('/index/form-basic/',            { templateUrl: TEMPLATE_PATH + 'index/form-basic.html', resolve: resolve })
    .when('/index/form-advanced/',         { templateUrl: TEMPLATE_PATH + 'index/form-advanced.html', resolve: resolve })
    .when('/index/form-wizard/',           { templateUrl: TEMPLATE_PATH + 'index/form-wizard.html', resolve: resolve })
    .when('/index/form-input-mask/',       { templateUrl: TEMPLATE_PATH + 'index/form-input-mask.html', resolve: resolve })
    .when('/index/form-multi-upload/',     { templateUrl: TEMPLATE_PATH + 'index/form-multi-upload.html', resolve: resolve })

    .when('/index/basic-table/',           { templateUrl: TEMPLATE_PATH + 'index/basic-table.html', resolve: resolve })
    .when('/index/data-table/',            { templateUrl: TEMPLATE_PATH + 'index/data-table.html', resolve: resolve })

    .when('/index/inbox/',                 { templateUrl: TEMPLATE_PATH + 'index/inbox.html', resolve: resolve })
    .when('/index/compose-mail/',          { templateUrl: TEMPLATE_PATH + 'index/compose-mail.html', resolve: resolve })

    .when('/index/charts/',                { templateUrl: TEMPLATE_PATH + 'index/charts.html', resolve: resolve })
   
    .when('/index/role/',                  { templateUrl: TEMPLATE_PATH + 'demo/role.html', resolve: resolve })
    .when('/index/user/',                  { templateUrl: TEMPLATE_PATH + 'demo/user.html', resolve: resolve })
    .when('/index/delivery/',              { templateUrl: TEMPLATE_PATH + 'demo/delivery.html', resolve: resolve })

    .when('/index/thanks/',                { templateUrl: TEMPLATE_PATH + 'index/thanks.html', resolve: resolve })
    .otherwise({
      resolve: {
        redirect: [
          '$route', '$location',
          function($route, $location) {
            if (/^\/index(.html)?/.test($location.$$path)) $location.path('/');
            else window.location.replace($location.$$path);
          }
        ]
      }
    });

    $locationProvider.html5Mode(false);
  }
])

.controller('CollapseDemoCtrl', [
  '$scope',
  function($scope) {
    
  }
])

.controller('TabsDemoCtrl', [
  '$scope',
  function($scope) {

  }
]);

angular.module('welcome', [
  'ngRoute',
  'system', 'public'
])

.config([
  '$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    function redirectTo(url) {
      window.location.replace(url);
    };

    $routeProvider.
    when('/welcome/',       {}).
    when('/welcome.html',   {}).
    otherwise({
      resolve: [
        '$route', '$location',
        function($route, $location) {
          var firstPath = '/' + $location.$$path.split('\/')[1] + '/',
          url = $location.$$url;

          if ($route.routes[firstPath]) {
            $location.path(firstPath);
          }
          else if (url) {
            window.location.replace(url);
          }
        }
      ]
    });

    $locationProvider.html5Mode(true);
  }
])

.controller('Welcome.Login', [
  '$rootScope', '$scope',
  function($rootScope, $scope) {
    $scope.username = '';
    $scope.password = '';
    $scope.captcha = '';
    $scope.captchaImage = '';
    $scope.disabled = false;

    $scope.newCaptcha = function() {
      if ($scope.disabled) return;
      // $scope.captchaImage = 'http://api.xiaozhisong.com/captcha/?' + Date.now();
    };

    $scope.submit = function(event) {
      if ($scope.disabled || (event && event.keyCode && event.keyCode !== 13)) return;

      var validUsername = $scope.form.username.$viewValue,
      validPassword = $scope.form.password.$viewValue,
      validCaptcha = $scope.form.captcha.$viewValue;

      if (validUsername && validPassword && validCaptcha) {
        $scope.disabled = true;

        $user.login({ username: validUsername, password: validPassword, captcha: validCaptcha }).
        then(function(data) { window.location.replace('/index/'); }).
        catch(function(msg) {
          alert(msg);
          
          $scope.disabled = false;
          $scope.captcha = '';
          $scope.newCaptcha();
        });
      }
    };

    $scope.newCaptcha();
  }
])