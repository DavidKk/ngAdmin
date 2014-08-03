

module.exports = function(grunt) {
	'use strict';

	var $path;
	$path = require('path');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		imagemin: {
			minify: {
				options: { optimizationLevel: 3 },
				files: [
					{ dest: 'assets/ico/', cwd: 'src/assets/ico/', src: ['*.{png,jpg,gif}'], expand: true },
					{ dest: 'assets/images/', cwd: 'src/assets/images/', src: ['*.{png,jpg,gif}'], expand: true }
				]
			}
		},

		less: {
			awesome: {
				options: { paths: ['src/assets/less/awesome/'], compress: true, yuicompress: true },
				files: { 'assets/css/font-awesome.css': 'src/assets/less/awesome/font-awesome.less'}
			},
			compile: {
				options: { paths: ['src/assets/less/app/'], compress: true, yuicompress: true },
				files: { 'assets/css/app.css': 'src/assets/less/app/module.less'}
			}
		},

		html2js: {
			ui: {
				options: {
					module: null,
					base: 'src/scripts/ui/',
					rename: function(path) { return path.replace($path.extname(path), '.html'); }
				},
				files: [
					{ dest: '_build/scripts/ui/', cwd: 'src/scripts/ui/templates/', src: ['**/*.jade'], ext: '.html.js', expand: true },
				]
			}
		},

		concat: {
			options: {
				separator: ';'
			},

			ui: {
				files: [
					{
						dest: 'scripts/ui.js',
						src: [
							'src/scripts/ui/app.js',
							'src/scripts/ui/libs/*.js',
							'src/scripts/ui/modules/*.js',
							'_build/scripts/ui/**/*.js'
						]
					}
				]
			},

			app: {
				files: [
					{
						dest: 'scripts/app.js',
						src: [
							'src/scripts/app/conf/*.js',
							'src/scripts/app/libs/*.js',
							'src/scripts/app/modules/*.js',
							'src/scripts/app/public/*.js',
							'src/scripts/app/pages/*.js',
							'src/scripts/app/pages/**/*.js'
						]
					}
				]
			}
		},

		ngmin: {
			minify: {
				files: [
					{ dest: 'scripts/', cwd: 'scripts/', src: ['*.js', '*/*.js'], expand: true }
				]
			}
		},

		uglify: {
			minify: {
				files: [
					{ dest: 'scripts/', cwd: 'scripts/', src: ['*.js', '*/*.js'], expand: true }
				]
			}
		},

		copy: {
			panel: {
				files: [
					{ dest: 'assets/fonts/', cwd: 'src/assets/fonts/', src: ['**'], expand: true },
					{ dest: 'assets/ico/', cwd: 'src/assets/ico/', src: ['**'], expand: true },
					{ dest: 'assets/css/', cwd: 'src/assets/css/', src: ['*.css'], expand: true },
					{ dest: 'assets/audio/', cwd: 'src/assets/audio/', src: ['*.ogg'], expand: true }
				]
			},
			script: {
				files: [
					{ dest: 'scripts/libs/', cwd: 'src/scripts/libs/', src: ['*.js'], expand: true },
				]
			}
		},

		clean: {
			dist: ['./assets', './scripts', './views'],
			build: ['./_build']
		},

		hashmap: {
			options: {
				output: '_build/hashmap.json',
				rename: '#{= dirname}/#{= basename}.#{= hash}#{= extname}'
			},
			version: {
				files: [
					{ dest: './', cwd: './', src: ['scripts/**', 'assets/css/**'] }
				]
			}
		},

		jade: {
			options: {
				data: function() {
					var pkg, map, makeHash;

					pkg = grunt.file.readJSON('package.json');
					map = {};

					makeHash = function(file) {
						var token, reg, ext, dir, name, path;
						for (token in map) {
							reg = new RegExp(token + '$');

							if (reg.test(file)) {
								dir = file.replace(reg, '');
								ext = /[.]/.exec(file) ? /[^.]+$/.exec(file) : undefined;
								name = token.replace(new RegExp('.' + ext + '$'), '');
								path = dir + name + '.' + map[token] + '.' + ext;
								break;
							}
						}

						return path || file;
					};

					try { map = grunt.file.readJSON('_build/hashmap.json'); }
					catch (e) {}

					return { pkg: pkg, map: map, makeHash: makeHash, updateTime: new Date() };
				}
			},

			pages: {
				files: [
					{ dest: 'views/', cwd: 'src/assets/jade/pages/', src: ['*.jade'], ext: '.html', expand: true }
				]
			},

			templates: {
				files: [
					{ dest: 'assets/templates/', cwd: 'src/assets/jade/templates/', src: ['{*,*/*}.jade'], ext: '.html', expand: true }
				]
			}
		},

		karma: {
			unit: {
				configFile: 'test/karma.conf.js',
				background: false
			}
		},

		watch: {
			public: {
				files: ['src/assets/ico/**', 'src/assets/images/**', 'src/assets/fonts/**', 'src/scripts/libs/**', 'src/scripts/ui/**'],
				tasks: ['imagemin:minify', 'copy:panel', 'copy:script']
			},
			less: {
				files: ['src/assets/less/app/**'],
				tasks: ['less:compile']
			},
			jade: {
				files: ['src/assets/jade/**'],
				tasks: ['jade']
			},
			ui: {
				files: ['src/scripts/ui/**'],
				tasks: ['html2js:ui', 'concat:ui']
			},
			script: {
				files: ['src/scripts/app/**'],
				tasks: ['concat:app']
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-hashmap');
	grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-ngmin');
	grunt.loadNpmTasks('grunt-karma');

	grunt.registerTask('style', ['imagemin', 'copy:panel', 'less']);
	grunt.registerTask('script', ['html2js', 'concat']);
	grunt.registerTask('render', ['jade']);

	grunt.registerTask('package', ['copy:panel', 'copy:script']);
	grunt.registerTask('compile', ['style', 'script', 'package']);

	grunt.registerTask('default', ['clean:dist', 'compile', 'render', 'clean:build', 'watch']);
	grunt.registerTask('test', ['karma']);
	grunt.registerTask('release', ['clean:dist', 'compile', 'uglify', 'hashmap', 'render', 'clean:build']);
};