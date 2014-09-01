

module.exports = function(grunt) {'use strict';

  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('assemble-less');
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

  var path = require('path');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    hashmapFile: '_build/hashmap.json',
    filename: 'ngAdmin',
    filenamecustom: '<%= filename %>-custom',

    scripts: {
      modules: [],
      srcModules: [],
      tplModules: []
    },

    styles: {
      components: [],
      srcComponents: []
    },

    meta: {
      modules:    'angular.module("ui.ngAdmin", [<%= scripts.srcModules %>]);',
      tplmodules: 'angular.module("ui.ngAdmin.tpls", [<%= scripts.tplModules %>]);',
      allmodules: 'angular.module("ui.ngAdmin", ["ui.ngAdmin.tpls", <%= scripts.srcModules %>]);',
      banner: ['/*',
               ' * <%= pkg.name %>',
               ' * <%= pkg.homepage %>\n',
               ' * Version: <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
               ' * License: <%= pkg.license %>',
               ' */\n'].join('\n')
    },

    // Clean temp files or documents.
    clean: {
      dist: ['./dist', './assets', './scripts', './views'],
      build: ['./_build']
    },

    // Copy files to dist.
    copy: {
      docs: {
        files: [
          { dest: 'assets/fonts/', cwd: 'src/fonts/', src: ['**'], expand: true },
          { dest: 'assets/ico/', cwd: 'src/ico/', src: ['**'], expand: true },
          { dest: 'assets/css/', cwd: 'src/css/', src: ['**'], expand: true },
          { dest: 'scripts/', cwd: 'src/scripts/libs/', src: ['*.js'], expand: true }
        ]
      }
    },

    // Compress images.
    imagemin: {
      docs: {
        options: { optimizationLevel: 3 },
        files: [
          { dest: 'assets/ico/', cwd: 'src/ico/', src: ['*.{png,jpg,gif}'], expand: true },
          { dest: 'assets/images/', cwd: 'src/images/', src: ['*.{png,jpg,gif}'], expand: true }
        ]
      }
    },

    // Complie less files
    less: {
      options: {
        paths: ['src/less/']
      },
      dist: {
        options: {
          banner: '<%= meta.banner %>',
          imports: {
            reference: [
              'variables/bootstrap.less',
              'variables/ngAdmin.less',
              'mixins/bootstrap.less',
              'mixins/lesshat.less',
              'mixins/msic.less'
            ]
          }
        },
        src: ['src/less/app.less'],
        dest: 'dist/<%= filename %>-<%= pkg.version %>.css'
      },

      // Demo style
      docs: {
        options: {
          compress: true,
          yuicompress: true
        },
        src: ['src/less/app.less'],
        dest: 'assets/css/<%= filename %>.css'
      }
    },

    cssmin: {
      dist: {
        options: {
          banner: '<%= meta.banner %>'
        },
        dest: 'dist/<%= filename %>-<%= pkg.version %>.min.css',
        src: '<%= less.dist.dest %>',
      }
    },

    // TODO: use coffeescript

    // Template jade to js file
    html2js: {
      dist: {
        options: {
          module: null,
          base: 'src/scripts/',
          rename: function(name) {
            return name.replace(path.extname(name), '.html');
          }
        },
        dest: '_build/scripts/tpls/',
        cwd: 'src/scripts/tpls/',
        src: ['**/*.jade'],
        ext: '.html.js',
        expand: true
      }
    },

    // Concat js files, 
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
          banner: '<%= meta.banner %><%= meta.allmodules %>\n<%= meta.tplmodules %>\n'
        },
        src: [],
        dest: 'dist/<%= filename %>-<%= pkg.version %>.tpls.js'
      },

      // Demo
      docs: {
        src: [],
        dest: 'scripts/<%= filename %>.js'
      }
    },

    // Minfily js files.
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
      },

      // Demo
      docs: {
        src: ['<%= concat.docs.dest %>'],
        dest: 'scripts/<%= filename %>.min.js'
      }
    },

    // Get files hash code.
    hashmap: {
      options: {
        keep: false,
        output: '<%= hashmapFile %>',
        rename: '#{= dirname}/#{= basename}.#{= hash}#{= extname}'
      },
      version: {
        files: [
          { dest: './', cwd: './', src: ['scripts/**', 'assets/css/**'] }
        ]
      }
    },

    // Complie jade file to html.
    jade: {
      options: {
        data: function() {
          var mapFilePath = grunt.config('hashmapFile'), map;
          if (grunt.file.exists(mapFilePath)) map = grunt.file.readJSON(mapFilePath);
          else map = {};

          return {
            pkg: grunt.config('pkg'),
            makeVersion: function(file) {
              var token, hash, reg, ext, dir, name, path;
              for (token in map) {
                reg = new RegExp(token + '$');

                // 匹配文件名称，将 hash 值作为版本号添加入路径中
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
      docs: {
        files: [
          { dest: 'views/', cwd: 'src/jade/pages/', src: ['*'], ext: '.html', expand: true }
        ]
      }
    },

    // TODO: unit test.

    // Watch files changed and auto run tasks.
    watch: {
      public: {
        files: ['src/ico/**', 'src/images/**', 'src/fonts/**', 'src/scripts/libs/**'],
        tasks: ['imagemin', 'copy:docs']
      },
      less: {
        files: ['src/less/**'],
        tasks: ['less:docs']
      },
      jade: {
        files: ['src/jade/**'],
        tasks: ['jade']
      },
      script: {
        files: ['src/scripts/**'],
        tasks: ['script']
      }
    }
  });

  var foundScriptModules = {};
  function findScriptModules(name) {
    if (foundScriptModules[name]) return;
    foundScriptModules[name] = true;

    var module = {
      name:         name,
      moduleName:   enquote('ui.' + name),
      displayName:  ucwords(breakup(name, ' ')),
      srcFiles:     'src/scripts/modules/' + name + '.js',
      tplFiles:     grunt.file.expand('src/scripts/tpls/' + name + '/*.jade'),
      tpljsFiles:   grunt.file.expand('_build/scripts/tpls/' + name + '/*.html.js'),
      tplModules:   grunt.file.expand('src/scripts/tpls/' + name + '/*.jade').map(function(filePath) {
        return enquote('tpls/' + name + '/' + path.basename(filePath).replace(path.extname(filePath), '.html'));
      }),
      dependencies: dependenciesForModule(name)
    };

    if (grunt.file.exists(module.srcFiles)) {
      module.dependencies.forEach(findScriptModules);
      grunt.config('scripts.modules', grunt.config('scripts.modules').concat(module));
    }
  }

  function dependenciesForModule(name) {
    var deps = [];
    grunt.file.expand('src/' + name + '/*.js')
    .map(grunt.file.read)
    .forEach(function(contents) {
      //Strategy: find where module is declared,
      //and from there get everything inside the [] and split them by comma
      var moduleDeclIndex = contents.indexOf('angular.module(');
      var depArrayStart = contents.indexOf('[', moduleDeclIndex);
      var depArrayEnd = contents.indexOf(']', depArrayStart);
      var dependencies = contents.substring(depArrayStart + 1, depArrayEnd);
      dependencies.split(',').forEach(function(dep) {
        if (dep.indexOf('ui.') > -1) {
          var depName = dep.trim().replace('ui.','').replace(/['"]/g,'');
          if (deps.indexOf(depName) < 0) {
            deps.push(depName);
            //Get dependencies for this new dependency
            deps = deps.concat(dependenciesForModule(depName));
          }
        }
      });
    });
    return deps;
  }

  var foundStyleComponents = {};
  function findStyleComponents(name) {
    if (foundStyleComponents[name]) return;
    foundStyleComponents[name] = true;

    var module = {
      name:           name,
      componentsName: enquote(name),
      displayName:    ucwords(breakup(name, ' ')),
      srcFiles:       'src/less/components/' + name + '.less'
    };

    grunt.file.exists(module.srcFiles) && grunt.config('styles.components', grunt.config('styles.components').concat(module));
  }

  function breakup(text, separator) {
    return text.replace(/[A-Z]/g, function(match) {
      return separator + match;
    });
  }

  function ucwords(text) {
    return text.replace(/^([a-z])|\s+([a-z])/g, function($1) {
      return $1.toUpperCase();
    });
  }

  function enquote(str) {
    return '"' + str + '"';
  }

  grunt.registerTask('style-custom', 'Create custom css components files.', function(a) {
    var _ = grunt.util._;

    //If arguments define what modules to build, build those. Else, everything
    if (this.args.length && a !== 'dev') {
      this.args.forEach(findStyleComponents);
      grunt.config('filename', grunt.config('filenamecustom'));
    }
    else {
      grunt.file.expand('src/less/components/*.less').forEach(function(file) {
        findStyleComponents(path.basename(file).replace(path.extname(file), ''));
      });
    }

    var components = grunt.config('styles.components');
    var srcFiles = _.pluck(components, 'srcFiles');
    grunt.config('less.dist.src', grunt.config('less.dist.src').concat(srcFiles));

    grunt.task.run(['less:dist', 'cssmin:dist']);
  });

  grunt.registerTask('script-custom', 'Create custom scripts files.', function(a) {
    var _ = grunt.util._;
    var type;

    //If arguments define what modules to build, build those. Else, everything
    if (this.args.length && a !== 'dev') {
      this.args.forEach(findScriptModules);
      grunt.config('filename', grunt.config('filenamecustom'));
    }
    else {
      grunt.file.expand('src/scripts/modules/*.js').forEach(function(file) {
        findScriptModules(path.basename(file).replace(path.extname(file), ''));
      });
    }

    var modules = grunt.config('scripts.modules');
    grunt.config('scripts.srcModules', _.pluck(modules, 'moduleName'));
    grunt.config('scripts.tplModules', _.pluck(modules, 'tplModules').filter(function(tpls) { return tpls.length > 0; }));
    
    var srcFiles = _.pluck(modules, 'srcFiles');
    var tpljsFiles = _.pluck(modules, 'tpljsFiles');

    // Develop mode
    if (a === 'dev') {
      grunt.config('concat.docs.src', grunt.config('concat.docs.src').concat(srcFiles));
      grunt.task.run(['html2js', 'concat:docs']);
    }
    // Custom modules
    else {
      grunt.config('concat.dist.src', grunt.config('concat.dist.src').concat(srcFiles));
      grunt.config('concat.distTpls.src', grunt.config('concat.distTpls.src').concat(srcFiles).concat(tpljsFiles));
      grunt.task.run(['html2js', 'concat:dist', 'concat:distTpls', 'uglify:dist', 'uglify:distTpls']);
    }
  });

  grunt.registerTask('test',      []);
  grunt.registerTask('dev',       ['clean', 'copy:docs', 'less:docs', 'script-custom:dev', 'jade', 'watch']);
  grunt.registerTask('release',   ['clean', 'copy:docs', 'less:docs', 'script-custom:dev', 'uglify:docs', 'hashmap', 'jade']);
  grunt.registerTask('build', 'Create custom files.', function() {
    var args = this.args.length ? ':' + this.args.join(':') : '';
    grunt.task.run(['clean', 'style-custom' + args, 'script-custom' + args, 'clean:build']);
  });

  grunt.registerTask('default',   ['dev']);
};