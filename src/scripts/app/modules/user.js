

angular.module('sys.user', [
	'config', 'ngLibs'
])

.factory('$user', [
	'$q', '$http',
	'$memory',
	function($q, $http, $memory) {'use strict';
		var exports = $memory.connect('USER_SESSION');

		return exports;
	}
])