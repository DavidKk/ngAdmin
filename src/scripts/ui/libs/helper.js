

angular.module('ui.helper', [])

.run(function() {
	// 'use strict';
	if (!angular.isFunction(angular.dateAdjust)) {
		angular.dateAdjust = function(date, part, amount) {
			part = part.toLowerCase();

			var map = { 
				years: 'FullYear', months: 'Month', weeks: 'Hours', days: 'Hours', hours: 'Hours', 
				minutes: 'Minutes', seconds: 'Seconds', milliseconds: 'Milliseconds',
				utcyears: 'UTCFullYear', utcmonths: 'UTCMonth', utcweeks: 'UTCHours', utcdays: 'UTCHours', 
				utchours: 'UTCHours', utcminutes: 'UTCMinutes', utcseconds: 'UTCSeconds', utcmilliseconds: 'UTCMilliseconds'
			},
			mapPart = map[part];

			if (part == 'weeks' || part == 'utcweeks') amount *= 168;
			if (part == 'days' || part == 'utcdays') amount *= 24;

			var setFucName = 'set' + mapPart,
			getFuncName = 'get'+ mapPart;

			date[setFucName](date[getFuncName]() + amount);			
		};
	}

	if (!angular.isFunction(angular.dateEach)) {
		angular.dateEach = function(beginDate, endDate, part, step, callback, bind) {
			var fromDate = new Date(beginDate.getTime()),
			toDate = new Date(endDate.getTime()),
			pm = fromDate <= toDate ? 1 : -1,
			i = 0;

			while ((pm === 1 && fromDate <= toDate) || (pm === -1 && fromDate >= toDate)) {
				if (callback.call(bind, fromDate, i, beginDate, endDate) === false) break;

				i += step;
				angular.dateAdjust(fromDate, part, step*pm);
			}
		};
	}

	if (!angular.isFunction(angular.quickSort)) {
		angular.quickSort = (function() {
			var INSERT_SORT_THRESHOLD = 10,
			compare = function(a, b, desc, key_or_func) {
				if (angular.isFunction(key_or_func)) {
					return desc === true ? key_or_func(a) > key_or_func(b) : key_or_func(a) < key_or_func(b);
				}

				if (angular.isString(key_or_func) && a.hasOwnProperty(key_or_func) && b.hasOwnProperty(key_or_func)) {
					return desc === true ? a[key_or_func] > b[key_or_func] : a[key_or_func] < b[key_or_func];
				}

				return desc === true ? a > b : a < b;
			},
			isort = function(xs, begin, end, desc, key) {
				var a, b, t;
				for (a = begin; a < end; a += 1) {
					t = xs[a];
					for (b = a; b > begin && compare(t, xs[b-1], desc, key); b -= 1) {
						xs[b] = xs[b-1];
					}

					xs[b] = t;
				}

				return xs;
			},
			medianOfThree = function(a, b, c, desc, key) {
				if (compare(a, b, desc, key)) {
					if (compare(b, c, desc, key)) return b;
					else if (compare(a, c, desc, key)) return c;
					else return a;
				}
				else {
					if (compare(a, c, desc, key)) return a;
					else if (compare(b, c, desc, key)) return c;
					else return b;
				}
			},
			vecswap = function(xs, a, b, c) {
				var n = Math.min(b - a, c - b),
				i = a,
				t, j;

				for (j = c - n, i = a; j < c; j += 1, i += 1) {
					t = xs[i];
					xs[i] = xs[j];
					xs[j] = t;
				}

				return a + (c - b);
			},
			sort = function(xs, begin, end, desc, key) {
				if (end < begin + INSERT_SORT_THRESHOLD) {
					isort(xs, begin, end, desc, key);
					return;
				}

				var i = begin - 1,
				j = end,
				u = i,
				v = j,
				pivot = medianOfThree(xs[begin], xs[Math.floor((begin + end) / 2)], xs[end -1], desc, key),
				t;

				while (i < j) {
					i += 1;
					while (i < j && compare(xs[i], pivot, desc, key)) i += 1;

					j -= 1;
					while (i < j && compare(pivot, xs[j], desc, key)) j -= 1;

					if (i < j) {
						t = xs[i];
						xs[i] = xs[j];
						xs[j] = t;

						if (!(compare(xs[i], pivot, desc, key))) {
							u += 1;
							t = xs[i];
							xs[i] = xs[u];
							xs[u] = t;
						}

						if (!compare(pivot, xs[j], desc, key)) {
							v -= 1;
							t = xs[j];
							xs[j] = xs[v];
							xs[v] = t;
						}
					}
				}

				j = vecswap(xs, i, v, end);
				i = vecswap(xs, begin, u + 1, i);

				sort(xs, begin, i, desc, key);
				sort(xs, j, end, desc, key);
			};

			return function(xs, desc, key, begin, end) {
				sort(xs, 'number' === typeof begin ? begin : 0, 'number' === typeof end ? end : xs.length, desc, key);
				return xs;
			};
		})();
	}
})

.constant('const-css3Transform', (function() {
	var style = angular.element('<div>')[0].style,
	modes = ['transform', 'MozTransform', 'WebkitTransform', 'OTransform'],
	i;

	for (i = 0; i < modes.length; i ++) {
		if (modes[i] in style) return modes[i];
	}

	return false;
})())


/* jshint strict: true, unused:true, undef:true, browser:true */
/* globals  console, document */

window.onload = function () {
	return;

    function isort(xs, start, end) {
        var a, b, t;
        for(a = start; a < end; a += 1) {
            t = xs[a];
            for(b = a; b > start && xs[b-1] > t; b -= 1) {
                xs[b] = xs[b-1];
            }
            xs[b] = t;
        }
        return xs;
    }

    var INSERT_SORT_THRESHOLD = 20;

    function medianOfThree(a, b, c) {
        if(a < b) {
            if(b < c) {
                return b;
            } else if (a < c) {
                return c;
            } else {
                return a;
            }
        } else {
            if(a < c) {
                return a;
            } else if (b < c) {
                return c;
            } else {
                return b;
            }
        }
    }
 
    function qsort2(xs) {
        sort(xs, 0, xs.length);
        return xs;

        function sort(xs, start, end) {
            if(end < start + INSERT_SORT_THRESHOLD ) {
                isort(xs, start, end);
                return;
            }

            var i = start - 1,
                j = end,
                u = i,
                v = j,
                pivot = medianOfThree(xs[start],
                                      xs[Math.floor((start + end) / 2)],
                                      xs[end-1]),
                t;

            while(i < j) {
                i += 1;
                while(i < j && xs[i] < pivot) {
                    i += 1;
                }

                j -= 1;
                while(i < j && pivot < xs[j]) {
                    j -= 1;
                }

                if(i < j) {
                    t = xs[i]; xs[i] = xs[j]; xs[j] = t;
                    /* jshint ignore:start */
                    // We are ignoring the !.  Just trying to stick
                    // with < for now...
                    if(!(xs[i] < pivot)) {
                        u += 1;
                        t = xs[i]; xs[i] = xs[u]; xs[u] = t;
                    }
                    if( !(pivot < xs[j])) {
                        v -= 1;
                        t = xs[j]; xs[j] = xs[v]; xs[v] = t;
                    }
                    /* jshint ignore:end */
                }
            }

            // if(xs[i] < pivot) { throw 'invariant'; }

            // Now, 'flip' the sides around to bring the values equal
            // to the pivot to the middle.

            j = vecswap(xs, i, v, end);
            i = vecswap(xs, start, u + 1, i);

            // xs[i] >= pivot.
            sort(xs, start, i);
            sort(xs, j, end);
        }
    }
    //QSORT2END

    // Shuffle the values such that all values originally in the range
    //  [a, b) are now in the range [result, c), and all values
    //  originally in [b, c) are now in [a, result).
    //
    // return result.

    function vecswap(xs, a, b, c) {
        var n = Math.min(b-a, c-b),
            i = a,
            t, j;
        for(j = c - n, i = a; j < c; j += 1, i += 1) {
            t = xs[i]; xs[i] = xs[j]; xs[j] = t;
        }
        return a + (c - b);
    }

    //
    // Data generation functions
    //

    function shuffled(N) {
        return function() {
            var result = [], i, j, t;
            for(i = 0; i < N; i += 1) {
                result[i] = i;
            }
            for(i = 0; i < N; i += 1) {
                j = Math.floor(Math.random() * i);
                t = result[i]; result[i] = result[j]; result[j] = t;
            }

            return result;
        };
    }

    function random(N) {
        return function() {
            var result = [], i;
            for(i = 0; i < N; i += 1) {
                result[i] = Math.random();
            }
            return result;
        };
    }

    function sawtooth(N, M) {
        return function() {
            var i, result = [];
            for(i = 0; i < N; i += 1) {
                result[i] = i % M;
            }
            return result;
        };
    }

    function scatter(N, M) {
        return function() {
            var i, result = [];
            for(i = 0; i < N; i += 1) {
                result[i] = (i * M + i) % N;
            }
            return result;
        };
    }


    function ordered(N) {
        return function() {
            var i, result = [];
            for(i = 0; i < N; i += 1) {
                result[i] = i;
            }
            return result;
        };
    }

    function reversed(N) {
        return function() {
            var i, result = [];
            for(i = 0; i < N; i += 1) {
                result[i] = N - i;
            }
            return result;
        };
    }

    // Setup asynchronous execution so stuff shows up on the browser
    // quicker.
    var queue = [];

    // Run the first value in the queue, if any.
    function runQueue() {
        var f;
        if(queue.length) {
            f = queue.shift();
            window.setTimeout(function () {
                f();
                runQueue();
            }, 50);
        }
    }


    var repeats = 5;

    queue.push(function () {
    log('warmup...');
        var data = sawtooth(2000, 4)();
        runTest(qsort2, data, repeats);
    });

    queue.push(function() {
        log('\nscatter');

        var data = scatter(1000000, 10)();
        runTest(qsort2, data, repeats);
        runTest(qsort1, data, repeats);
        runTest(sys, data, repeats);
    });

    queue.push(function (){
        log('\nrandom');
        var data = random(1000000)();
        runTest(qsort2, data, repeats);
        runTest(qsort1, data, repeats);
        runTest(sys, data, repeats);
    });


    queue.push(function() {
        log('\nsawtooth');

        var data = sawtooth(1000000, 2)();
        runTest(qsort2, data, repeats);
        runTest(qsort1, data, repeats);
        runTest(sys, data, repeats);
    });

    queue.push(function () {


        log('\nordered');
        var data = ordered(1000000, 10)();
        runTest(qsort2, data, repeats);
        runTest(qsort1, data, repeats);
        runTest(sys, data, repeats);
    });

    queue.push(function() {
        log('\nreversed');

        var data = reversed(1000000, 10)();
        runTest(qsort2, data, repeats);
        runTest(qsort1, data, repeats);
        runTest(sys, data, repeats);
    });

    queue.push(function () {
        log('\nshuffled');
        var data = shuffled(1000000)();
        runTest(qsort2, data, repeats);
        runTest(qsort1, data, repeats);
        runTest(sys, data, repeats);
    });

    // start it up!
    runQueue();

};
