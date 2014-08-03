

angular.module('ngDevice', [
	'config', 'ngHelper'
])

.service('$tabs', [
	'$rootScope', '$window',
	function($rootScope, $window) {'use strict';
		var exports = this,
		handles = {};

		$window.onfocus = function() {
			if (! angular.isArray(handles.focus)) return;
			
			$rootScope.$apply(function() {
				angular.forEach(handles.focus, function(handle) {
					handle();
				});
			});
		};

		$window.onblur = function() {
			if (! angular.isArray(handles.focus)) return;
			
			$rootScope.$apply(function() {
				angular.forEach(handles.focus, function(handle) {
					handle();
				});
			});
		};

		exports.on = function(type, callback) {
			if (! angular.isFunction(callback)) return;
			if (! angular.isArray(handles[type])) handles[type] = [];
			handles[type].push(callback);
		};
	}
])