/**
 * Entrance Module
 * @author <David Jones qowera@qq.com>
 */
angular.module('index', [
  'ngRoute'
  , 'conf.config', 'helpers.util'
  , 'header', 'nav'
  // , 'decorate'
])

.constant('TEMPLATE_PATH', '/assets/templates/simulator')

.constant('NAVIGATION', [
  {
    name: 'Simulator', key: 'index', icon: 'laptop'
  },
  {
    name: 'Applications', key: 'applications', icon: 'cubes',
    child: [
      { name: 'Docs', key: 'docs', url: '/docs', target: '_self' }
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
    .when('/simulator/',          { templateUrl: TEMPLATE_PATH + '/index.html', resolve: resolve })
    .when('/simulator/index/',    { templateUrl: TEMPLATE_PATH + '/index.html', resolve: resolve })
    .when('/simulator/simulator', { templateUrl: TEMPLATE_PATH + '/index.html', resolve: resolve })
  }
])