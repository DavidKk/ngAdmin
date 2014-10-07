

angular.module('index', [
  'ngRoute', 'ui.ngAdmin',
  'chat', 'header', 'navigation',
  'charts'
])

.constant('TEMPLATE_PATH', './assets/templates/')

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
      { name: 'iScroll', key: 'iscroll' }
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
    .when('/index/iscroll/',               { templateUrl: TEMPLATE_PATH + 'index/iscroll.html', resolve: resolve })

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
])