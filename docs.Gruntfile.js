/*!
 * ngAdmin's docs.Gruntfile
 * 
 * Copyright
 * Licensed
 */

module.exports = function(grunt) {'use strict';
  
  var path = require('path'),
      helper = require('./grunt.helper')(grunt);

  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-hashmap');
  grunt.loadNpmTasks('grunt-karma');

  grunt.config.merge({
    pkg: grunt.file.readJSON('package.json'),
    filename: 'ngAdmin',
    tempPath: './.temp/',
    hashmapFile: '<%= tempPath %>hashmap.json',

    styles: {
      docs: {
        deps: [
          'docs/less/variables/**.less',
          'docs/less/mixins/*.less',
          'docs/less/effects/*.less',
          'docs/less/pages/*/*.less',
          'docs/less/pages/*/*/*.less'
        ]
      }
    },

    clean: {
      docs: ['./demo/*', '!./demo/.git/', '!./demo/.DS_Store'],
      temp: ['<%= tempPath %>']
    },

    copy: {
      docs: {
        files: [
          { dest: 'demo/ico/', cwd: 'docs/ico/', src: ['*.ico'], expand: true },
          { dest: 'demo/fonts/', cwd: 'docs/fonts/', src: ['**'], expand: true },
          { dest: 'demo/svg/', cwd: 'docs/svg/', src: ['*.svg'], expand: true },
          { dest: 'demo/css/', cwd: 'docs/css/', src: ['*.css'], expand: true },
          { dest: 'demo/scripts/', cwd: 'docs/scripts/libs/', src: ['*.js'], expand: true }
        ]
      }
    },

    imagemin: {
      docs: {
        options: { optimizationLevel: 3 },
        files: [
          { dest: 'demo/ico/', cwd: 'docs/ico/', src: ['*.{png,jpg,gif}'], expand: true },
          { dest: 'demo/images/', cwd: 'docs/images/', src: ['*.{png,jpg,gif}'], expand: true }
        ]
      }
    },

    less: {
      docs: {
        options: {
          paths: ['./', './docs/less/'],
          compress: true,
          yuicompress: true
        },
        src: ['<%= tempPath %>less/app.docs.less'],
        dest: 'demo/css/<%= filename %>-<%= pkg.version %>.docs.min.css'
      }
    },

    hashmap: {
      options: {
        keep: false,
        output: '<%= hashmapFile %>',
        rename: '#{= dirname}/#{= basename}.#{= hash}#{= extname}'
      },

      docs: {
        dest: './',
        cwd: './',
        src: ['demo/scripts/**', 'demo/css/**']
      }
    },

    jade: {
      docs: {
        options: {
          data: function() {
            var mapFilePath = grunt.config('hashmapFile'),
                map;

            if (grunt.file.exists(mapFilePath)) {
              map = grunt.file.readJSON(mapFilePath);
            }
            else {
              map = {};
            }

            return {
              pkg: grunt.config('pkg'),
              makeVersion: function(file) {
                var token, hash, reg, ext, dir, name, path;
                for (token in map) {
                  reg = new RegExp(token + '$');

                  if (reg.test(file)) {
                    dir = file.replace(reg, '');
                    ext = /[.]/.exec(file) ? /[^.]+$/.exec(file) : undefined;
                    name = token.replace(new RegExp('.' + ext + '$'), '');
                    hash = map[token];                  
                    path = dir + name + '.' + hash + '.' + ext;
                    break;
                  }
                }

                return path || file;
              }
            };
          }
        },
        dest: 'demo/',
        cwd: 'docs/jade/pages/',
        src: ['*.jade'],
        ext: '.html',
        expand: true
      },
      'docs-template': {
        options: '<$= jade.docs.options %>',
        dest: 'demo/templates/',
        cwd: 'docs/jade/templates/',
        src: ['*/*.jade'],
        ext: '.html',
        expand: true
      }
    },

    concat: {
      docs: {
        src: ['docs/scripts/partials/*.js', 'docs/scripts/pages/*.js'],
        dest: 'demo/scripts/<%= filename %>-<%= pkg.version %>.docs.js'
      }
    },

    uglify: {
      docs: {
        src: ['<%= concat.docs.dest %>'],
        dest: 'demo/scripts/<%= filename %>-<%= pkg.version %>.docs.min.js'
      }
    },

    watch: {
      'docs-jade': {
        files: ['docs/jade/**'],
        tasks: ['jade:docs', 'jade:docs-template']
      },
      'docs-less': {
        files: ['docs/less/**'],
        tasks: ['style-docs']
      },
      'docs-scripts': {
        files: ['docs/scripts/**'],
        tasks: ['script-docs']
      }
    }
  });

  grunt.registerTask('style-docs', 'Add style files to docs.', function() {
    var _ = grunt.util._,
        tempFile = grunt.config('tempPath') + 'less/app.docs.less',
        modules = [],
        source = '';

    grunt.file
    .expand(grunt.config('styles.docs.deps'))
    .forEach(function(file) {
      var filePath = file.replace(path.extname(file), ''),
          module = helper.findStyle(filePath);

      if (grunt.file.exists(module.file)) {
        modules = modules.concat(module);
      }
    });

    source += _.pluck(modules, 'import').join('\n');
    grunt.file.write(tempFile, source);
    grunt.task.run(['less:docs', 'clean:temp']);
  });

  grunt.registerTask('script-docs', ['concat:docs', 'uglify:docs', 'clean:temp']);
  
  grunt.registerTask('build-docs-pkg', ['clean:docs', 'copy:docs', 'imagemin:docs']);
  grunt.registerTask('build-docs', ['jade:docs', 'jade:docs-template', 'style-docs', 'script-docs']);
  grunt.registerTask('build-docs-dev', ['build-docs-pkg', 'build-docs']);
  grunt.registerTask('build-docs-release', ['build-docs-pkg', 'hashmap:docs', 'build-docs']);
  grunt.registerTask('default', ['build-docs-dev', 'watch']);
};