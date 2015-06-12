/**
 * Entrance Module
 * @author <David Jones qowera@qq.com>
 */
angular.module('docs', [
  'ngRoute'
  , 'conf.config', 'helpers.util'
  , 'ui.bootstrap', 'ui.checkbox', 'ui.radio', 'ui.switch'
  , 'chat', 'header', 'nav'
])

.constant('TEMPLATE_PATH', '/assets/templates/docs')

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
      { name: 'Slider', key: 'slide' }
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
      { name: 'Frontend', key: 'front-end', url: '/front-end', target: '_self' },
      { name: 'Welcome', key: 'welcome', url: '/welcome', target: '_self' },
      { name: '404', key: '404', url: '/404', target: '_self' }
    ]
  },
  {
    name: 'Applications', key: 'applications', icon: 'laptop',
    child: [
      { name: 'Simulator', key: 'simulator', url: '/simulator', target: '_self' }
    ]
  },
  {
    name: 'Contributors', key: 'contributors', icon: 'user-secret',
    child: [
      { name: 'David Jones', key: 'davidjones', url: '//about.davidkk.com', target: '_self' }
    ]
  },
  {
    name: 'Team', key: 'team', icon: 'group',
    child: [
      { name: 'Blog', key: 'blog', url: '//blog.ishgo.cn', target: '_self' }
    ]
  }
])

.config([
  '$routeProvider', '$locationProvider',
  'TEMPLATE_PATH',
  function($routeProvider, $locationProvider, TEMPLATE_PATH) {
    var resolve = {
      checkin: [
        '$q',
        function($q) {
          var deferred = $q.defer()

          deferred.resolve()
          return deferred.promise
        }
      ]
    }

    $routeProvider
    // Dashboard
    .when('/',                            { templateUrl: TEMPLATE_PATH + '/dashboard.html', resolve: resolve })
    .when('/docs/',                       { templateUrl: TEMPLATE_PATH + '/dashboard.html', resolve: resolve })
    .when('/docs/dashboard/',             { templateUrl: TEMPLATE_PATH + '/dashboard.html', resolve: resolve })

    // Basic UI Elements
    .when('/docs/colors/',                { templateUrl: TEMPLATE_PATH + '/colors.html', resolve: resolve })
    .when('/docs/buttons/',               { templateUrl: TEMPLATE_PATH + '/buttons.html', resolve: resolve })
    .when('/docs/typography/',            { templateUrl: TEMPLATE_PATH + '/typography.html', resolve: resolve })
    .when('/docs/badges-label/',          { templateUrl: TEMPLATE_PATH + '/badges-label.html', resolve: resolve })
    .when('/docs/blockquotes/',           { templateUrl: TEMPLATE_PATH + '/blockquotes.html', resolve: resolve })
    .when('/docs/alert/',                 { templateUrl: TEMPLATE_PATH + '/alert.html', resolve: resolve })
    .when('/docs/navbars/',               { templateUrl: TEMPLATE_PATH + '/navbars.html', resolve: resolve })
    .when('/docs/pagination/',            { templateUrl: TEMPLATE_PATH + '/pagination.html', resolve: resolve })
    .when('/docs/breadcrumbs/',           { templateUrl: TEMPLATE_PATH + '/breadcrumbs.html', resolve: resolve })

    // Advanced UI Elements
    .when('/docs/tiles/',                 { templateUrl: TEMPLATE_PATH + '/tiles.html', resolve: resolve })
    .when('/docs/panels/',                { templateUrl: TEMPLATE_PATH + '/panels.html', resolve: resolve })
    .when('/docs/tabs-accordions/',       { templateUrl: TEMPLATE_PATH + '/tabs-accordions.html', resolve: resolve })
    .when('/docs/tooltips-popovers/',     { templateUrl: TEMPLATE_PATH + '/tooltips-popovers.html', resolve: resolve })
    .when('/docs/progress-bar/',          { templateUrl: TEMPLATE_PATH + '/progress-bar.html', resolve: resolve })
    .when('/docs/modals/',                { templateUrl: TEMPLATE_PATH + '/modals.html', resolve: resolve })
    .when('/docs/slide/',                 { templateUrl: TEMPLATE_PATH + '/slide.html', resolve: resolve })
    .when('/docs/carousel/',              { templateUrl: TEMPLATE_PATH + '/carousel.html', resolve: resolve })

    // Forms
    .when('/docs/form-basic/',            { templateUrl: TEMPLATE_PATH + '/form-basic.html', resolve: resolve })
    .when('/docs/form-advanced/',         { templateUrl: TEMPLATE_PATH + '/form-advanced.html', resolve: resolve })
    .when('/docs/form-wizard/',           { templateUrl: TEMPLATE_PATH + '/form-wizard.html', resolve: resolve })
    .when('/docs/form-input-mask/',       { templateUrl: TEMPLATE_PATH + '/form-input-mask.html', resolve: resolve })
    .when('/docs/form-multi-upload/',     { templateUrl: TEMPLATE_PATH + '/form-multi-upload.html', resolve: resolve })

    // Tables
    .when('/docs/basic-table/',           { templateUrl: TEMPLATE_PATH + '/basic-table.html', resolve: resolve })
    .when('/docs/data-table/',            { templateUrl: TEMPLATE_PATH + '/data-table.html', resolve: resolve })

    // Mail
    .when('/docs/inbox/',                 { templateUrl: TEMPLATE_PATH + '/inbox.html', resolve: resolve })
    .when('/docs/compose-mail/',          { templateUrl: TEMPLATE_PATH + '/compose-mail.html', resolve: resolve })

    // Charts
    .when('/docs/charts/',                { templateUrl: TEMPLATE_PATH + '/charts.html', resolve: resolve })
    
    // Thanks
    .when('/docs/thanks/',                { templateUrl: TEMPLATE_PATH + '/thanks.html', resolve: resolve })
  }
])

.controller('FooController', [
  '$scope',
  function($scope) {
    // nothing to do...
  }
])

.controller('ModalInstanceController', [
  '$scope', '$modalInstance',
  function($scope, $modalInstance) {
    $scope.ok = function() {
      $modalInstance.close()
    }

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel')
    }
  }
])

.controller('ModalsController', [
  '$scope', '$modal',
  function($scope, $modal) {
    'use strict'

    $scope.open = function(size) {
      var modalInstance = $modal.open({
        animation: true
        , templateUrl: '/templates/modal/modal.html'
        , controller: 'ModalInstanceController'
      })

      modalInstance.result
      .then(function() {
        // do something after click ok...
      },
      function() {
        // do something after click cancel...
      })
    }
  }
])