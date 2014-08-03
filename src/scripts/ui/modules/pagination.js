

angular.module('ui.pagination', [])

.controller('PaginationController', [
	'$scope',
	function($scope) {
		
	}
])

.directive('pagination', [
	function() {
		return {
			restrict: 'EA',
			replace: true,
			templateUrl: 'template/pagination/pagination.html',
			require: ['?ngModel'],
			scope: {},
			link: function($scope, $element, $attrs, ctrls) {
				var model = ctrls[0];
				$scope.selectPage = function() {
					ngModelCtrl.$render();
				};

				$scope.$watch(function() {
					return model.$modelValue;
				}, function(value) {

					$scope.currentPage = value;
					$scope.totalPage = Math.ceil($scope.totalSize/$scope.pageSize);
					$scope.startPage = $scope.currentPage - $scope.maxSize;
					if ($scope.startPage < 1) $scope.startPage = 1;

					$scope.endPage = $scope.startPage + $scope.maxSize;
					if ($scope.endPage > $scope.totalPage) $scope.endPage = $scope.totalPage;
				});
			}
		};
	}
])