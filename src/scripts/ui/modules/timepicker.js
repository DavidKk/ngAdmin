

angular.module('ui.timepicker', [
	'ui.helper',
	'ui.scrollpicker'
])

.constant('const-weeks', ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'])
.constant('const-dvisions', ['AM', 'PM'])

.controller('TimepickerController', [
	'$scope',
	'const-weeks', 'const-dvisions',
	function($scope, constWeeks, constDvisions) {
		var exports = this,
		hours = [];

		$scope.dates = [];
		$scope.fullHours = [];
		$scope.hours = {};
		$scope.hours[constDvisions[0]] = [];
		$scope.hours[constDvisions[1]] = [];
		$scope.minutes = [];
		$scope.seconds = [];
		$scope.dvisions = [];
		$scope.selects = [];

		var cleanSplitHours = function() {
			var amh = $scope.hours[constDvisions[0]],
			pmh = $scope.hours[constDvisions[1]];

			amh.splice(0, amh.length);
			pmh.splice(0, pmh.length);
		};

		var splitHours = function() {
			cleanSplitHours();

			var amh = $scope.hours[constDvisions[0]],
			pmh = $scope.hours[constDvisions[1]],
			h;

			angular.forEach($scope.fullHours, function(hour) {
				if (Number(hour) < 12) amh.push(hour);
				else pmh.push(hour == 12 ? 12 : hour -12);
			});
		};

		exports.addDates = function(begin_or_dates, until) {
			var week, year, month, date, key;
			if (arguments.length > 1) {
				var begin = begin_or_dates;

				if (begin instanceof Date && until instanceof Date) {
					var week, year, month, date, key;
					angular.dateEach(begin, until, 'days', 1, function(loopDate, times) {
						year = loopDate.getFullYear();
						month = loopDate.getMonth();
						date = loopDate.getDate();
						day = loopDate.getDay();
						key = parseInt(loopDate.getTime()/(1000*60*60*24));

						$scope.dates.push({
							key: key,
							year: year,
							month: month +1,
							date: date,
							day: day,
							week: constWeeks[day]
						});
					});

					angular.quickSort($scope.dates, false, 'key');
				}				
			}
			else if (begin_or_dates instanceof Date) {
				var inDate = begin_or_dates,
				i, flag;

				key = parseInt(inDate.getTime()/(1000*60*60*24));
				for (i = 0, dates = $scope.dates; i < dates.length; i ++) {
					if (dates.key === key) {
						flag = false;
						break;
					}
				}

				if (flag !== false) {
					year = inDate.getFullYear();
					month = inDate.getMonth();
					date = inDate.getDate();
					day = inDate.getDay();

					$scope.dates.push({
						key: key,
						year: year,
						month: month +1,
						date: date,
						day: day,
						week: constWeeks[day]
					});

					angular.quickSort($scope.dates, false, 'key');
				}
			}
			else if (angular.isArray(begin_or_dates)) {
				var arr = [],
				dates = begin_or_dates;

				angular.forEach(dates, function(date) {
					exports.addDates(date);
				});
			}
		};

		exports.delDates = function(begin_or_dates_or_type, until) {
			var key;
			if (arguments.length > 1) {
				var begin = begin_or_dates_or_type;
				if (begin instanceof Date && until instanceof Date) {
					angular.dateEach(begin, until, 'days', 1, function(loopDate) {
						key = parseInt(loopDate.getTime()/(1000*60*60*24));

						for (var i = 0; i < $scope.dates; i ++) {
							if ($scope.dates[i].key === key) {
								$scope.dates.splice(i, 1);
								break;
							}
						}
					});
				}
			}
			else if (begin_or_dates_or_type === 'weekend') {
				for (var i = 0, dates = $scope.dates; i < dates.length; i ++) {
					if (dates[i].day === 0 || dates[i].day === 6) {
						$scope.dates.splice(i, 1);
						i --;
					}
				}
			}
			else if (begin_or_dates_or_type instanceof Date) {
				var date = begin_or_dates_or_type,
				i, dates;
				key = parseInt(date.getTime()/(1000*60*60*24));

				for (i = 0, dates = $scope.dates; i < dates.length; i ++) {
					if (dates[i].key === key) {
						$scope.dates.splice(i, 1);
						break;
					}
				}
			}
			else if (angular.isArray(begin_or_dates_or_type)) {
				var dates = begin_or_dates_or_type;
				angular.forEach(dates, function(date) {
					exports.delDates(date);
				});
			}
		};

		exports.cleanDates = function() {
			$scope.dates.splice(0, $scope.dates.length);
		};

		exports.setDates = function(begin_or_dates, until) {
			exports.cleanDates();
			exports.addDates.apply(exports, arguments);
		};

		exports.addHours = function(begin_or_hours, until, step) {
			step = step || 1;

			var hours = [];
			if (arguments.length > 1) {
				for (var i = parseInt(begin_or_hours), j = parseInt(until); i <= j; i += step) {
					hours.push(i);
				}

				exports.addHours(hours);
			}
			else {
				hours = angular.isArray(begin_or_hours) ? begin_or_hours : [begin_or_hours];
				angular.forEach(hours, function(hour) {
					minute = parseInt(hour);
					if (0 < hour && hour < 24) {
						if (-1 === angular.inArray(hour, $scope.hours)) {
							$scope.fullHours.push(hour);
						}
					}
				});				

				angular.quickSort($scope.fullHours, false);
			}

			splitHours();
		};

		exports.delHours = function(begin_or_hours, until, step) {
			step = step || 1;
			var hours = [];
			if (arguments.length > 1) {
				for (var i = parseInt(begin_or_hours), j = parseInt(until); i <= j; i += step) {
					hours.push(i);
				}

				exports.delHours(hours);
			}
			else {
				hours = angular.isArray(begin_or_hours) ? begin_or_hours : [begin_or_hours];

				var index, i, hours;
				for (i = 0, hours = $scope.fullHours; i < hours.length; i ++) {
					var index = angular.inArray(hours[i], $scope.fullHours);
					if (-1 !== index) $scope.fullHours.splice(index, 1);
					i --;
				}			
			}

			splitHours();
		};

		exports.cleanHours = function() {
			$scope.fullHours.splice(0, $scope.fullHours.length);
			cleanSplitHours();
		};

		exports.setHours = function() {
			exports.delHours();
			exports.addHours.apply(exports, arguments);
		};

		exports.addMinutes = function(begin_or_minutes, until, step) {
			step = step || 1;

			var minutes = [];
			if (arguments.length > 1) {
				for (var i = parseInt(begin_or_minutes), j = parseInt(until); i <= j; i += step) {
					minutes.push(i);
				}

				exports.addMinutes(minutes);
			}
			else {
				minutes = angular.isArray(begin_or_minutes) ? begin_or_minutes : [begin_or_minutes];
				angular.forEach(minutes, function(minute) {
					minute = parseInt(minute);
					if (0 <= minute && minute < 60) {
						if (-1 === angular.inArray(minute, $scope.minutes)) {
							$scope.minutes.push(minute);
						}
					}
				});

				angular.quickSort($scope.minutes, false);
			}
		};

		exports.delMinutes = function(begin_or_minutes, until, step) {
			step = step || 1;

			var minutes = [];
			if (arguments.length > 1) {
				for (var i = parseInt(begin_or_minutes), j = parseInt(until); i <= j; i += step) {
					minutes.push(i);
				}

				exports.delMinutes(minutes);
			}
			else {
				minutes = angular.isArray(begin_or_minutes) ? begin_or_minutes : [begin_or_minutes];

				var index, i, minutes;
				for (i = 0, minutes = $scope.minutes; i < minutes.length; i ++) {
					var index = angular.inArray(minutes[i], $scope.minutes);
					if (-1 !== index) $scope.minutes.splice(index, 1);
					i --;
				}	
			}
		};

		exports.cleanMinutes = function() {
			$scope.minutes.splice(0, $scope.minutes.length);
		};

		exports.setMinutes = function() {
			exports.cleanMinutes();
			exports.addMinutes.apply(exports, arguments);
		};

		exports.addSeconds = function(begin_or_seconds, until, step) {
			step = step || 1;

			var seconds = [];
			if (arguments.length > 1) {
				for (var i = parseInt(begin_or_seconds), j = parseInt(until); i <= j; i += step) {
					seconds.push(i);
				}

				exports.addSeconds(seconds);
			}
			else {
				seconds = angular.isArray(begin_or_seconds) ? begin_or_seconds : [begin_or_seconds];
				angular.forEach(seconds, function(second) {
					second = parseInt(second);
					if (0 <= second && second < 60) {
						if (-1 === angular.inArray(second, $scope.seconds)) {
							$scope.seconds.push(second);
						}
					}
				});

				angular.quickSort($scope.seconds, false);
			}
		};

		exports.delSeconds = function(begin_or_seconds, until, step) {
			step = step || 1;

			var seconds = [];
			if (arguments.length > 1) {
				for (var i = parseInt(begin_or_seconds), j = parseInt(until); i <= j; i += step) {
					seconds.push(i);
				}

				exports.delSeconds(seconds);
			}
			else {
				seconds = angular.isArray(begin_or_seconds) ? begin_or_seconds : [begin_or_seconds];

				var index, i, seconds;
				for (i = 0, seconds = $scope.seconds; i < seconds.length; i ++) {
					var index = angular.inArray(seconds[i], $scope.seconds);
					if (-1 !== index) $scope.seconds.splice(index, 1);
					i --;
				}	
			}
		};

		exports.cleanSeconds = function() {
			$scope.seconds.splice(0, $scope.seconds.length);
		}

		exports.setSeconds = function(begin_or_seconds, until, step) {
			exports.cleanSeconds();
			exports.addSeconds.apply(exports, arguments);
		};

		exports.addDvisions = function(dvisions) {
			dvisions = angular.isArray(dvisions) ? dvisions : [dvisions];
			angular.forEach(dvisions, function(dvision) {
				if (-1 !== angular.inArray(dvision, constDvisions) && -1 === angular.inArray(dvision, $scope.dvisions)) {
					$scope.dvisions.push(dvision);
				}
			});

			angular.quickSort($scope.dvisions, false);
		};

		exports.delDvisions = function(dvisions) {
			dvisions = angular.isArray(dvisions) ? dvisions : [dvisions];

			var index, i, dvisions;
			for (i = 0, dvisions = $scope.dvisions; i < dvisions.length; i ++) {
				var index = angular.inArray(dvisions[i], $scope.dvisions);
				if (-1 !== index) $scope.dvisions.splice(index, 1);
				i --;
			}
		};

		exports.cleanDvisions = function() {
			$scope.dvisions.splice(0, $scope.dvisions.length);
		};

		exports.setDvision = function() {
			exports.cleanDvisions();
			exports.addDvisions.apply(exports, arguments);
		};

		exports.selectDate = function(date) {
			if (date instanceof Date) date = parseInt(date.getTime()/(1000*60*60*24));
			else if (angular.isNumeric(date)) return;			
			$scope.selects[0] = Number(date);
		};

		exports.selectHour = function(hour) {
			if (! angular.isNumeric(hour)) return;
			$scope.selects[1] = Number(hour);
		};

		exports.selectMinute = function(minute) {
			if (! angular.isNumeric(minute)) return;
			$scope.selects[2] = Number(minute);
		};
 
		exports.selectSecond = function(second) {
			if (! angular.isNumeric(second)) return;
			$scope.selects[3] = Number(second);
		};

		exports.selectDvision = function(dvision) {
			var index = angular.inArray(dvision, constDvisions);
			if (-1 === index) return;

			$scope.selects[4] = dvision;
			var hour = Number($scope.hours[dvision][1] || $scope.hours[dvision][0]);
			hour = index == 0 ? hour : hour == 12 ? hour : hour + 12;

			exports.selectHour(hour);
		};

		exports.select = function(date, hour, minute, second, dvision) {
			exports.selectDate(date);
			exports.selectHour(hour);
			exports.selectMinute(minute);
			exports.selectSecond(second);
			exports.selectDvision(dvision);
		};

		exports.getTime = function() {
			var selects = $scope.selects,
			date = new Date(),
			time = selects[0]*1000*60*60*24,
			hour = selects[4] === 'AM' ? selects[1] : selects[1] +12,
			minutes = selects[2],
			seconds = selects[3];

			angular.isNumber(time) && date.setTime(time);
			angular.isNumber(hour) && date.setHours(hour);
			angular.isNumber(minutes) && date.setMinutes(minutes);
			angular.isNumber(seconds) && date.setSeconds(seconds);

			return date.getTime();
		};

		$scope.selectDate = function(date) { exports.selectDate(date); };
		$scope.selectHour = function(hour) { exports.selectHour(hour); };
		$scope.selectMinute = function(minute) { exports.selectMinute(minute); };
		$scope.selectSecond = function(second) { exports.selectSecond(second); };
		$scope.selectDvision = function(dvision) { exports.selectDvision(dvision); };

		var begin = new Date(), end = new Date();
		end.setDate(begin.getDate() + 2);

		exports.addDates(begin, end);
		exports.addHours(0, 24);
		exports.addMinutes(0, 60, 5);
		exports.addDvisions(constDvisions);
		exports.select(begin, 1, 30, '', 'AM');

		$scope.$watch(exports.getTime, function(value) {
			exports.ngModel.$setViewValue(new Date(value));
		});
	}
])

.directive('timepicker', [
	function() {
		return {
			restrict: 'EA',
			transclude: true,
			replace: true,
			controller: 'TimepickerController',
			templateUrl: 'template/timepicker/timepicker.html',
			require: ['timepicker', '?^ngModel'],
			scope: {},
			link: function($scope, $element, $attrs, ctrls) {
				var timepickerCtrl = ctrls[0],
				ngModel = ctrls[1];

				timepickerCtrl.ngModel = ngModel;

				var dates = ($attrs.dates || '').replace(/([\[\]\s])+/g, '').split(','),
				hours = ($attrs.hours || '').replace(/[\[\]\s]+/g, '').split(','),
				minutes = ($attrs.minutes || '').replace(/[\[\]\s]+/g, '').split(','),
				seconds = ($attrs.seconds || '').replace(/[\[\]\s]+/g, '').split(',');

				if (angular.isArray(dates) && dates.length > 0) {
					if (dates.length > 2) {
						angular.forEach(dates, function(date) {
							timepickerCtrl.addDates(new Date(date));
						});
					}
					else timepickerCtrl.addDates(new Date(dates[0]), new Date(dates[1]));
				}

				if (angular.isArray(hours) && hours.length > 0) {
					if (hours.length > 2) timepickerCtrl.addHours.apply(timepickerCtrl, hours);
					else timepickerCtrl.addHours(hours[0], hours[1]);
				}

				if (angular.isArray(minutes) && minutes.length > 0) {
					if (minutes.length > 2) timepickerCtrl.addMinutes.apply(timepickerCtrl, minutes);
					else timepickerCtrl.addMinutes(minutes[0], minutes[1]);
				}

				if (angular.isArray(seconds) && seconds.length > 0) {
					if (seconds.length > 2) timepickerCtrl.addseconds.apply(timepickerCtrl, seconds);
					else timepickerCtrl.addSeconds(seconds[0], seconds[1]);
				}
			}
		};
	}
])