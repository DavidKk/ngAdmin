/*!
 * ngAdmin's Gruntfile
 * 
 * Copyright
 * Licensed
 */

module.exports = function(grunt) {'use strict';

  require('./docs.Gruntfile')(grunt);

  var path = require('path'),
      helper = require('./grunt.helper')(grunt);

  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-karma');

  grunt.config.merge({
    pkg: grunt.file.readJSON('package.json'),
    filename: 'ngAdmin',
    filenamecustom: '<%= filename %>-custom',
    tempPath: './.temp/',

    styles: {
      dist: {
        deps: [
          'src/less/variables/*.less',
          'src/less/mixins/*.less',
          'src/less/reset/*.less',
          'src/less/core/*.less',
          'src/less/effects/*.less',
          'src/less/components/*.less',
          'src/less/script_components/*.less',
          'src/less/utilities/*.less',
          'src/less/partials/*/main.less',
          'src/less/partials/*/*.less'
        ]
      }
    },

    scripts: {
      dist: {
        modules: [],
        srcModules: [],
        tplModules: []
      }
    },

    meta: {
      modules: 'angular.module("ui.ngAdmin", [<%= scripts.dist.srcModules %>]);',
      tplmodules: 'angular.module("ui.ngAdmin.tpls", [<%= scripts.dist.tplModules %>]);',
      fullmodules: 'angular.module("ui.ngAdmin", ["ui.ngAdmin.tpls", <%= scripts.dist.srcModules %>]);',
      banner: ['/*',
               ' * <%= pkg.name %>',
               ' * <%= pkg.homepage %>\n',
               ' * Version: <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
               ' * License: <%= pkg.license %>',
               ' */\n'].join('\n')
    },

    clean: {
      dist: ['./dist/*'],
      temp: ['<%= tempPath %>']
    },

    copy: {
      'dist-css': {
        files: [
          { dest: 'docs/css/', cwd: 'dist/', src: ['*.css'], expand: true },
          { dest: 'demo/css/', cwd: 'dist/', src: ['*.css'], expand: true }
        ]
      },
      'dist-scripts': {
        files: [
          { dest: 'docs/scripts/libs/', cwd: 'dist/', src: ['*.js'], expand: true },
          { dest: 'demo/scripts/', cwd: 'dist/', src: ['*.js'], expand: true }
        ]
      }
    },

    less: {
      options: {
        paths: ['./', './src/less/'],
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: ['src/less/app.less'],
        dest: 'dist/<%= filename %>-<%= pkg.version %>.css'
      },
      customizer: {
        src: ['<%= tempPath %>less/app-custom.less'],
        dest: 'dist/<%= filenamecustom %>-<%= pkg.version %>.css'
      }
    },

    cssmin: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        dest: 'dist/<%= filename %>-<%= pkg.version %>.min.css',
        src: '<%= less.dist.dest %>',
      },
      customizer: {
        dest: 'dist/<%= filenamecustom %>-<%= pkg.version %>.min.css',
        src: '<%= less.customizer.dest %>',
      }
    },

    html2js: {
      dist: {
        options: {
          module: null,
          base: 'src/scripts/',
          rename: function(name) {
            return name.replace(path.extname(name), '.html');
          }
        },
        dest: '<%= tempPath %>scripts/tpls/',
        cwd: 'src/scripts/tpls/',
        src: ['**/*.jade'],
        ext: '.html.js',
        expand: true
      }
    },

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        options: {
          banner: '<%= meta.banner %><%= meta.modules %>\n'
        },
        src: [],
        dest: 'dist/<%= filename %>-<%= pkg.version %>.js'
      },
      distTpls: {
        options: {
          banner: '<%= meta.banner %><%= meta.fullmodules %>\n<%= meta.tplmodules %>\n'
        },
        src: [],
        dest: 'dist/<%= filename %>-<%= pkg.version %>.tpls.js'
      }
    },

    uglify: {
      dist: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: ['<%= concat.dist.dest %>'],
        dest: 'dist/<%= filename %>-<%= pkg.version %>.min.js'
      },
      distTpls: {
        options: {
          banner: '<%= meta.banner %>'
        },
        src: ['<%= concat.distTpls.dest %>'],
        dest: 'dist/<%= filename %>-<%= pkg.version %>.tpls.min.js'
      }
    },

    // TODO: unit test.
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },

    watch: {
      'dist-less': {
        files: ['src/less/**'],
        tasks: ['style-customizer', 'copy:dist-css']
      },
      'dist-scripts': {
        files: ['src/scripts/**'],
        tasks: ['html2js:dist', 'scripts-customizer', 'copy:dist-scripts']
      }
    }
  });

  grunt.registerTask('style-customizer', 'Add style files to customizer.', function() {
    var _ = grunt.util._,
        tempFile,
        modules = [],
        source = '';

    grunt.file
    .expand(grunt.config('styles.dist.deps'))
    .forEach(function(file) {
      var filePath = file.replace(path.extname(file), ''),
          module = helper.findStyle(filePath);

      if (grunt.file.exists(module.file)) {
        modules = modules.concat(module);
      }
    });

    var args = this.args,
        imports = _.pluck(modules, 'import'),
        moduleNames = _.pluck(modules, 'name');

    if (args.length) {
      var index;
      args.forEach(function(module) {
        index = moduleNames.indexOf(module);
        -1 !== index && imports.splice(index, 1);
      });

      tempFile = grunt.config('tempPath') + 'less/app-custom.less';
    }
    else {
      tempFile = grunt.config('tempPath') + 'less/app.less';
      grunt.task.run(['less:dist', 'cssmin:dist', 'clean:temp']);
    }

    source += _.pluck(modules, 'import').join('\n');
    grunt.file.write(tempFile, source);
  });

  grunt.registerTask('scripts-customizer', 'Add scripts files to customizer.', function() {
    grunt.task.requires('html2js:dist');

    var _ = grunt.util._,
        args = this.args;

    if (!args.length) {
      args = [];
      grunt.file.expand('src/scripts/modules/*.js')
      .forEach(function(file) {
        args.push(path.basename(file).replace(path.extname(file), ''));
      });
    }

    var modules = helper.findScript(args),
        srcFiles = _.pluck(modules, 'srcFile'),
        tpljsFiles = _.pluck(modules, 'tpljsFile');

    grunt.config('scripts.dist.srcModules', _.pluck(modules, 'moduleName'));
    grunt.config('scripts.dist.tplModules', _.pluck(modules, 'tplModule').filter(function(tpls) {
      return tpls.length > 0;
    }));

    grunt.config('concat.dist.src', grunt.config('concat.dist.src').concat(srcFiles));
    grunt.config('concat.distTpls.src', grunt.config('concat.distTpls.src').concat(srcFiles).concat(tpljsFiles));
    grunt.task.run(['concat:dist', 'concat:distTpls', 'uglify:dist', 'uglify:distTpls', 'clean:temp']);
  });
  
  grunt.registerTask('build-dist-test', ['karma:unit']);
  grunt.registerTask('build-dist', ['clean:dist', 'style-customizer', 'html2js:dist', 'scripts-customizer'])
  grunt.registerTask('build-dist-dev', ['build-dist', 'copy:dist-css', 'copy:dist-scripts', 'build-docs-dev']);
  grunt.registerTask('default', ['build-dist-dev', 'watch']);
};