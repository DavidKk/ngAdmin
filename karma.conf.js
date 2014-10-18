

module.exports = function(config) {
  config.set({
    basePath: './',
    files: [
      'misc/test-libs/angular-1.2.23.min.js',
      'src/scripts/*/test/*.spec.js'
    ],
    autoWatch: true,
    frameworks: ['jasmine'],
    browsers: ['Chrome'],
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher'
    ]
  });
};