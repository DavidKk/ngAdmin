

angular.module('chat', [])

.controller('Chat', [
  '$rootScope', '$scope',
  function($rootScope, $scope) {
    var exports = this;

  }
]);

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
]);

angular.module('navigation', [])

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

angular.module('charts', [])

.controller('AreaChart', [
  '$scope',
  function($scope) {
    
  }
]);

angular.module('index', [
  'ngRoute',
  'ui.bootstrap', 'ui.ngAdmin',
  'chat', 'header', 'navigation',
  'charts'
])

.constant('TEMPLATE_PATH', '//' + window.location.host + '/assets/templates/')

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
      { name: 'Carousel', key: 'carousel' }
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
      { name: 'Frontend', key: 'front-end', url: '/front-end/', target: '_self' },
      { name: 'welcome', key: 'welcome', url: '/welcome/', target: '_self' },
      { name: '404', key: '404', url: '/404/', target: '_self' }
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

    $routeProvider.
    when('/ngAdmin/',                             { templateUrl: TEMPLATE_PATH + 'index/dashboard.html', resolve: resolve }).
    when('/ngAdmin/index/',                       { templateUrl: TEMPLATE_PATH + 'index/dashboard.html', resolve: resolve }).
    when('/ngAdmin/index/dashboard/',             { templateUrl: TEMPLATE_PATH + 'index/dashboard.html', resolve: resolve }).

    when('/ngAdmin/index/colors/',                { templateUrl: TEMPLATE_PATH + 'index/colors.html', resolve: resolve }).
    when('/ngAdmin/index/buttons/',               { templateUrl: TEMPLATE_PATH + 'index/buttons.html', resolve: resolve }).
    when('/ngAdmin/index/typography/',            { templateUrl: TEMPLATE_PATH + 'index/typography.html', resolve: resolve }).
    when('/ngAdmin/index/badges-label/',          { templateUrl: TEMPLATE_PATH + 'index/badges-label.html', resolve: resolve }).
    when('/ngAdmin/index/blockquotes/',           { templateUrl: TEMPLATE_PATH + 'index/blockquotes.html', resolve: resolve }).
    when('/ngAdmin/index/alert/',                 { templateUrl: TEMPLATE_PATH + 'index/alert.html', resolve: resolve }).
    when('/ngAdmin/index/navbars/',               { templateUrl: TEMPLATE_PATH + 'index/navbars.html', resolve: resolve }).
    when('/ngAdmin/index/pagination/',            { templateUrl: TEMPLATE_PATH + 'index/pagination.html', resolve: resolve }).
    when('/ngAdmin/index/breadcrumbs/',           { templateUrl: TEMPLATE_PATH + 'index/breadcrumbs.html', resolve: resolve }).

    when('/ngAdmin/index/tiles/',                 { templateUrl: TEMPLATE_PATH + 'index/tiles.html', resolve: resolve }).
    when('/ngAdmin/index/panels/',                { templateUrl: TEMPLATE_PATH + 'index/panels.html', resolve: resolve }).
    when('/ngAdmin/index/tabs-accordions/',       { templateUrl: TEMPLATE_PATH + 'index/tabs-accordions.html', resolve: resolve }).
    when('/ngAdmin/index/tooltips-popovers/',     { templateUrl: TEMPLATE_PATH + 'index/tooltips-popovers.html', resolve: resolve }).
    when('/ngAdmin/index/progress-bar/',          { templateUrl: TEMPLATE_PATH + 'index/progress-bar.html', resolve: resolve }).
    when('/ngAdmin/index/modals/',                { templateUrl: TEMPLATE_PATH + 'index/modals.html', resolve: resolve }).
    when('/ngAdmin/index/slide/',                 { templateUrl: TEMPLATE_PATH + 'index/slide.html', resolve: resolve }).
    when('/ngAdmin/index/carousel/',              { templateUrl: TEMPLATE_PATH + 'index/carousel.html', resolve: resolve }).

    when('/ngAdmin/index/form-basic/',            { templateUrl: TEMPLATE_PATH + 'index/form-basic.html', resolve: resolve }).
    when('/ngAdmin/index/form-advanced/',         { templateUrl: TEMPLATE_PATH + 'index/form-advanced.html', resolve: resolve }).
    when('/ngAdmin/index/form-wizard/',           { templateUrl: TEMPLATE_PATH + 'index/form-wizard.html', resolve: resolve }).
    when('/ngAdmin/index/form-input-mask/',       { templateUrl: TEMPLATE_PATH + 'index/form-input-mask.html', resolve: resolve }).
    when('/ngAdmin/index/form-multi-upload/',     { templateUrl: TEMPLATE_PATH + 'index/form-multi-upload.html', resolve: resolve }).

    when('/ngAdmin/index/basic-table/',           { templateUrl: TEMPLATE_PATH + 'index/basic-table.html', resolve: resolve }).
    when('/ngAdmin/index/data-table/',            { templateUrl: TEMPLATE_PATH + 'index/data-table.html', resolve: resolve }).

    when('/ngAdmin/index/inbox/',                 { templateUrl: TEMPLATE_PATH + 'index/inbox.html', resolve: resolve }).
    when('/ngAdmin/index/compose-mail/',          { templateUrl: TEMPLATE_PATH + 'index/compose-mail.html', resolve: resolve }).

    when('/ngAdmin/index/charts/',                { templateUrl: TEMPLATE_PATH + 'index/charts.html', resolve: resolve }).
   
    when('/ngAdmin/index/role/',                  { templateUrl: TEMPLATE_PATH + 'demo/role.html', resolve: resolve }).
    when('/ngAdmin/index/user/',                  { templateUrl: TEMPLATE_PATH + 'demo/user.html', resolve: resolve }).
    when('/ngAdmin/index/delivery/',              { templateUrl: TEMPLATE_PATH + 'demo/delivery.html', resolve: resolve }).

    when('/ngAdmin/index/thanks/',                { templateUrl: TEMPLATE_PATH + 'index/thanks.html', resolve: resolve }).
    otherwise({
      resolve: {
        redirect: [
          '$route', '$location',
          function($route, $location) {
            if (/^\/index(.html)?/.test($location.$$path)) $location.path('/ngAdmin/index/delivery/');
            else window.location.replace($location.$$path);
          }
        ]
      }
    });

    $locationProvider.html5Mode(true);
  }
]);

angular.module('welcome', [
  'ngRoute',
  'system', 'public'
])

.config([
  '$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    function redirectTo(url) { window.location.replace(url); };

    $routeProvider.
    when('/welcome/',     {}).
    when('/welcome.html',   {}).
    otherwise({
      resolve: [
        '$route', '$location',
        function($route, $location) {
          var firstPath = '/' + $location.$$path.split('\/')[1] + '/',
          url = $location.$$url;

          if ($route.routes[firstPath]) $location.path(firstPath);
          else if (url) window.location.replace(url);
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