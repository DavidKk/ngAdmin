/**
 * Chart Module
 * @author <David Jones qowera@qq.com>
 */
angular.module('charts', [
  'highcharts-ng'
])

.controller('AreaDemoChartController', [
  '$scope',
  function($scope) {
    $scope.chartConfig = {
      options: {
        chart: {
          type: 'areaspline'
        },
        plotOptions: {
          series: {
            stacking: ''
          }
        }
      },
      series: [
        {
          data: [9, 19, 10, 8, 19, 19, 15, 17, 14, 2],
          id: 'series-4',
          type: 'area'
        }
      ],
      title: {
        text: 'Area'
      },
      credits: {
        enabled: true
      },
      loading: false,
      size: {}
    }
  }
])

.controller('LineDemoChartController', [
  '$scope',
  function($scope) {
    $scope.chartConfig = {
      options: {
        chart: {
          type: 'areaspline'
        },
        plotOptions: {
          series: {
            stacking: ''
          }
        }
      },
      series: [
        {
          data: [9, 19, 10, 8, 19, 19, 15, 17, 14, 2],
          id: 'series-4',
          type: 'line'
        }
      ],
      title: {
        text: 'Line'
      },
      credits: {
        enabled: true
      },
      loading: false,
      size: {}
    }
  }
])

.controller('BarDemoChartController', [
  '$scope',
  function($scope) {
    $scope.chartConfig = {
      options: {
        chart: {
          type: 'bar'
        },
        plotOptions: {
          series: {
            stacking: ''
          }
        }
      },
      series: [{
        data: [9, 19, 10, 8, 19, 19, 15, 17, 14, 2],
        id: 'series-4',
        type: 'area'
      }],
      title: {
        text: 'Bar'
      },
      credits: {
        enabled: true
      },
      loading: false,
      size: {}
    }
  }
])

.controller('ColumnDemoChartController', [
  '$scope',
  function($scope) {
    $scope.chartConfig = {
      options: {
        chart: {
          type: 'column'
        },
        plotOptions: {
          series: {
            stacking: ''
          }
        }
      },
      series: [
        {
          name: 'Some data',
          data: [1, 2, 4, 7, 3, 1, 10, 20, 1, 10, 20],
          id: 'series-0',
          type: 'scatter'
        }
      ],
      title: {
        text: 'Column'
      },
      credits: {
        enabled: true
      },
      loading: false,
      size: {}
    };
  }
])

.controller('PieDemoChartController', [
  '$scope',
  function($scope) {
    $scope.chartConfig = {
      options: {
        chart: {
          type: 'areaspline'
        },
        plotOptions: {
          series: {
            stacking: 'normal'
          }
        }
      },
      series: [{
        name: 'Some data',
        data: [1, 2, 4, 7, 3],
        id: 'series-0',
        type: 'pie'
      }],
      title: {
        text: 'Hello'
      },
      credits: {
        enabled: true
      },
      loading: false,
      size: {}
    }
  }
])

.controller('ScatterDemoChartController', [
  '$scope',
  function($scope) {
    $scope.chartConfig = {
      options: {
        chart: {
          type: 'column'
        },
        plotOptions: {
          series: {
            stacking: ""
          }
        }
      },
      series: [
        {
          name: 'Some data',
          data: [1, 2, 4, 7, 3, 1, 10, 20, 1, 10, 20],
          id: 'series-0',
          type: 'scatter'
        }
      ],
      title: {
        text: 'Scatter'
      },
      credits: {
        enabled: true
      },
      loading: false,
      size: {}
    }
  }
])
