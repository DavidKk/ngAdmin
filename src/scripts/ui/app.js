

angular.module('ui', [
	'ui.bootstrap.transition',
	'ui.helper',

	'ui.dropdownMenu',
	'ui.promptBox',
	'ui.tabs',
	'ui.slideMenu',
	'ui.selecter',
	'ui.timepicker',
	'ui.wrapper',
	
	'ui.tpl'
]);

angular.module('ui.tpl', [
	'templates/selecter/selecter.html'
])