

angular.module('ui.app', [
  'ngLibs',

  'ui.dropdownMenu',
  'ui.promptBox',
  'ui.tabs',
  'ui.scroll-bar',
  'ui.slideMenu',
  'ui.selecter',
  'ui.timepicker',
  'ui.wrapper',
  
  'ui.tpl'
]);

angular.module('ui.tpl', [
  'templates/scroll-bar/scroll-bar.html',
  'templates/selecter/selecter.html'
])