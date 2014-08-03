

angular.module('ngDB', [
	'config', 'ngHelper',
	'ngDevice'
])

.service('$localStorage', [
	'$rootScope', '$tabs',
	function($rootScope, $tabs) {
		var exports = this;

		exports.getItem = function(token) {
			try {
				var s = window.localStorage.getItem(token);
				return angular.fromJson(s);
			}
			catch(e) { return {}; }
		};

		exports.setItem = function(token, value) {
			var data = angular.toJson(value);
			window.localStorage.setItem(token, data);
		};

		exports.removeItem = function(token) {
			window.localStorage.removeItem(token);
		};

		exports.clean = function() {
			window.localStorage.clear();
		};
	}
])

.service('$database', [
	'$rootScope',
	'$tabs', '$localStorage',
	function($rootScope, $tabs, $localStorage) {'use strict';
		var exports = this,
		database = {};

		function Table(name, datas) {
			datas = angular.isObject(datas) ? datas : {};
			var exports = this;

			exports.$$name = name;
			exports.$$handles = [];
			exports.$$data = datas ? datas.data : [];
			exports.$$updateTime = datas.updateTime || Date.now();
			exports.$$hash;
		}

		Table.prototype.$update = function() {
			var exports = this,
			storage = $localStorage.getItem(exports.$$name) || {};

			if (angular.isNumeric(storage.updateTime) && storage.updateTime > exports.$$updateTime) {
				exports.$$data = storage.data || [];
				exports.$$updateTime = storage.updateTime || Date.now();
				exports.$emit('change');
			}
		};

		Table.prototype.$storage = function() {
			var exports = this;
			$localStorage.setItem(exports.$$name, { data: exports.$$data, updateTime: Date.now() });
			exports.$emit('change');
		};

		Table.prototype.$get = function(index) {
			var exports = this, data;

			exports.$update();
			return angular.isDefined(index) ? exports.$$data[index] : exports.$$data;
		};

		Table.prototype.$edit = function(index, data) {
			var exports = this;

			exports.$update();
			exports.$$data[index] = data;
			exports.$storage();
		};

		Table.prototype.$add = function(data) {
			var exports = this;

			exports.$update();
			exports.$$data.push(data);
			exports.$storage();
		};

		Table.prototype.$delete = function(index) {
			var exports = this;

			exports.$update();
			exports.$$data.splice(index, 1);
			exports.$storage();
		};

		Table.prototype.$clean = function() {
			var exports = this;
			exports.$$data = [];
			exports.$storage();
		};

		Table.prototype.$inTable = function(data) {
			return angular.inArray(data, this.$$data);
		};

		Table.prototype.$inTableBy = function(value, index) {
			return angular.inArrayBy(value, this.$$data, index);
		};

		Table.prototype.$count = function() {
			return this.$$data.length;
		};

		Table.prototype.$on = function(type, callback) {
			var exports = this;

			if (! angular.isArray(exports.$$handles[type])) exports.$$handles[type] = [];
			exports.$$handles[type].push(callback);
		};

		Table.prototype.$emit = function(type) {
			var exports = this,
			newHash = angular.toJson(exports.$$data);
			
			if ('change' === type) {
				if (exports.$$hash !== newHash) {
					angular.forEach(exports.$$handles[type], function(handle) {
						handle(exports.$$data, exports.$$hash && angular.fromJson(exports.$$hash));
					});

					exports.$$hash = newHash;
				}
			}
			else {
				var args = Array.prototype.splice.call(arguments, 1, arguments.length);
				angular.forEach(exports.$$handles[type], function(handle) {
					handle.apply(exports, args);
				});
			}
		};
		
		Table.prototype.$destory = function() {
			$localStorage.removeItem(this.$$name);
		};

		exports.connect = function(table, object) {
			return (database[table] = new Table(table, $localStorage.getItem(table)));
		};

		exports.update = function() {
			angular.forEach(database, function(table) {
				table.$update();
			});
		};

		$tabs.on('focus', exports.update);

		$rootScope.$watch(function() { return angular.toJson(database); }, function() {
			angular.forEach(database, function(table, name) {
				table.$emit('type');
			});
		});
	}
])

.service('$memory', [
	'$rootScope',
	'$tabs', '$localStorage',
	function($rootScope, $tabs, $localStorage) {'use strict';
		var exports = this,
		database = {};

		function Table(name, datas) {
			datas = angular.isObject(datas) ? datas : {};
			var exports = this;

			exports.$$name = name;
			exports.$$handles = [];
			exports.$$data = datas ? datas.data : {};
			exports.$$updateTime = datas.updateTime || Date.now();
			exports.$$hash;
		}

		Table.prototype.$update = function() {
			var exports = this,
			storage = $localStorage.getItem(exports.$$name) || {};

			if (angular.isNumeric(storage.updateTime) && storage.updateTime > exports.$$updateTime) {
				exports.$$data = storage.data || {};
				exports.$$updateTime = storage.updateTime || Date.now();
				exports.$emit('change');
			}
		};

		Table.prototype.$storage = function() {
			var exports = this;
			$localStorage.setItem(exports.$$name, { data: exports.$$data, updateTime: Date.now() });
			exports.$emit('change');
		};

		Table.prototype.$get = function(ns) {
			var exports = this, data;

			exports.$update();
			return ns ? angular.namespace(ns, exports.$$data) : exports.$$data;
		};

		Table.prototype.$put = function(a, b) {
			var exports = this;

			exports.$update();
			if (arguments.length > 1) angular.make(a, exports.$$data, b);
			else exports.$$data = a;
			exports.$storage();
		};

		Table.prototype.$delete = function(index) {
			var exports = this;

			exports.$update();
			exports.$$data.splice(index, 1);
			exports.$storage();
		};

		Table.prototype.$clean = function() {
			var exports = this;
			exports.$$data = {};
			exports.$storage();
		};

		Table.prototype.$on = function(type, callback) {
			var exports = this;

			if (! angular.isArray(exports.$$handles[type])) exports.$$handles[type] = [];
			exports.$$handles[type].push(callback);
		};

		Table.prototype.$emit = function(type) {
			var exports = this,
			newHash = angular.toJson(exports.$$data);
			
			if ('change' === type) {
				if (exports.$$hash !== newHash) {
					angular.forEach(exports.$$handles[type], function(handle) {
						handle(exports.$$data, exports.$$hash && angular.fromJson(exports.$$hash));
					});

					exports.$$hash = newHash;
				}
			}
			else {
				var args = Array.prototype.splice.call(arguments, 1, arguments.length);
				angular.forEach(exports.$$handles[type], function(handle) {
					handle.apply(exports, args);
				});
			}
		};
		
		Table.prototype.$destory = function() {
			$localStorage.removeItem(this.$$name);
		};

		exports.update = function() {
			angular.forEach(database, function(table) {
				table.$update();
			});
		};

		exports.connect = function(table, object) {
			return (database[table] = new Table(table, $localStorage.getItem(table), object || []));
		};

		$tabs.on('focus', exports.update);
	
		$rootScope.$watch(function() { return angular.toJson(database); }, function() {
			angular.forEach(database, function(table, name) {
				table.$emit('type');
			});
		});
	}
])