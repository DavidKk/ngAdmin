

angular.module('index.config', [])

.constant('TEMPLATE_PATH', '//' + window.location.host + '/assets/templates/index/')

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
      { name: 'Slider', key: 'slide' },
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
      { name: 'Multi Upload', key: 'form-multi-upload' }
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
      { name: 'Mart System', key: 'mart', url: '/mart/', target: '_self' }
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
        '$q', '$user',
        function($q, $user) {
          var deferred = $q.defer();
          deferred.resolve();
          return deferred.promise;
        }
      ]
    };

    $routeProvider.
    when('/',                             { templateUrl: TEMPLATE_PATH + 'dashboard.html', resolve: resolve }).
    when('/index/dashboard/',             { templateUrl: TEMPLATE_PATH + 'dashboard.html', resolve: resolve }).
    
    when('/index/colors/',                { templateUrl: TEMPLATE_PATH + 'colors.html', resolve: resolve }).
    when('/index/buttons/',               { templateUrl: TEMPLATE_PATH + 'buttons.html', resolve: resolve }).
    when('/index/typography/',            { templateUrl: TEMPLATE_PATH + 'typography.html', resolve: resolve }).
    when('/index/badges-label/',          { templateUrl: TEMPLATE_PATH + 'badges-label.html', resolve: resolve }).
    when('/index/blockquotes/',           { templateUrl: TEMPLATE_PATH + 'blockquotes.html', resolve: resolve }).
    when('/index/alert/',                 { templateUrl: TEMPLATE_PATH + 'alert.html', resolve: resolve }).
    when('/index/navbars/',               { templateUrl: TEMPLATE_PATH + 'navbars.html', resolve: resolve }).
    when('/index/pagination/',            { templateUrl: TEMPLATE_PATH + 'pagination.html', resolve: resolve }).
    when('/index/breadcrumbs/',           { templateUrl: TEMPLATE_PATH + 'breadcrumbs.html', resolve: resolve }).
    
    when('/index/tiles/',                 { templateUrl: TEMPLATE_PATH + 'tiles.html', resolve: resolve }).
    when('/index/panels/',                { templateUrl: TEMPLATE_PATH + 'panels.html', resolve: resolve }).
    when('/index/tabs-accordions/',       { templateUrl: TEMPLATE_PATH + 'tabs-accordions.html', resolve: resolve }).
    when('/index/tooltips-popovers/',     { templateUrl: TEMPLATE_PATH + 'tooltips-popovers.html', resolve: resolve }).
    when('/index/progress-bar/',          { templateUrl: TEMPLATE_PATH + 'progress-bar.html', resolve: resolve }).
    when('/index/modals/',                { templateUrl: TEMPLATE_PATH + 'modals.html', resolve: resolve }).
    when('/index/slide/',                 { templateUrl: TEMPLATE_PATH + 'slide.html', resolve: resolve }).
    when('/index/carousel/',              { templateUrl: TEMPLATE_PATH + 'carousel.html', resolve: resolve }).

    when('/index/form-basic/',            { templateUrl: TEMPLATE_PATH + 'form-components.html', resolve: resolve }).
    when('/index/form-advanced/',         { templateUrl: TEMPLATE_PATH + 'form-validation.html', resolve: resolve }).
    when('/index/form-wizard/',           { templateUrl: TEMPLATE_PATH + 'form-wizard.html', resolve: resolve }).
    when('/index/form-input-mask/',       { templateUrl: TEMPLATE_PATH + 'form-input-mask.html', resolve: resolve }).
    when('/index/form-multi-upload/',     { templateUrl: TEMPLATE_PATH + 'form-multi-upload.html', resolve: resolve }).
    
    when('/index/basic-table/',           { templateUrl: TEMPLATE_PATH + 'basic-table.html', resolve: resolve }).
    when('/index/data-table/',            { templateUrl: TEMPLATE_PATH + 'data-table.html', resolve: resolve }).

    when('/index/inbox/',                 { templateUrl: TEMPLATE_PATH + 'inbox.html', resolve: resolve }).
    when('/index/compose-mail/',          { templateUrl: TEMPLATE_PATH + 'compose-mail.html', resolve: resolve }).

    when('/index/charts/',                { templateUrl: TEMPLATE_PATH + 'charts.html', resolve: resolve }).

    when('/index/thanks/',                { templateUrl: TEMPLATE_PATH + 'thanks.html', resolve: resolve }).
    otherwise({
      resolve: {
        redirect: [
          '$route', '$location',
          function($route, $location) {
            if (/^\/index(.html)?/.test($location.$$path)) $location.path('/index/delivery/');
            else window.location.replace($location.$$path);
          }
        ]
      }
    });

    $locationProvider.html5Mode(true);
  }
])