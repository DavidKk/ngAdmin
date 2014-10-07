/*!
 * ngAdmin's Gruntfile
 * 
 * Copyright
 * Licensed
 */

module.exports = function(grunt) {'use strict';

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

  var path = require('path');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    filename: 'ngAdmin',
    filenamecustom: '<%= filename %>-custom',
    hashmapFile: '_build/hashmap.json',
    customStyleFile: '_build/less/app.less',

    scripts: {
      modules: [],
      srcModules: [],
      tplModules: []
    },

    styles: {
      modules: [],
      imports: [],
      files: []
    },

    meta: {
      modules: 'angular.module("ui.ngAdmin", [<%= scripts.srcModules %>]);',
      tplmodules: 'angular.module("ui.ngAdmin.tpls", [<%= scripts.tplModules %>]);',
      fullmodules: 'angular.module("ui.ngAdmin", ["ui.ngAdmin.tpls", <%= scripts.srcModules %>]);',
      banner: ['/*',
               ' * <%= pkg.name %>',
               ' * <%= pkg.homepage %>\n',
               ' * Version: <%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
               ' * License: <%= pkg.license %>',
               ' */\n'].join('\n')
    },

    clean: {
      dist: ['./dist', './demo/*', '!./demo/.git/', '!./demo/.DS_Store'],
      build: ['./_build']
    },

    copy: {
      docs: {
        files: [
          { dest: 'demo/assets/ico/', cwd: 'docs/ico/', src: ['*.ico'], expand: true },
          { dest: 'demo/assets/fonts/', cwd: 'docs/fonts/', src: ['**'], expand: true },
          { dest: 'demo/assets/css/', cwd: 'docs/css/', src: ['*.css'], expand: true },
          { dest: 'demo/assets/svg/', cwd: 'docs/svg/', src: ['*.svg'], expand: true },
          { dest: 'demo/scripts/', cwd: 'docs/scripts/libs/', src: ['**'], expand: true },
          { dest: 'demo/assets/css/', cwd: 'dist/', src: ['*.css'], expand: true },
          { dest: 'demo/scripts/', cwd: 'dist/', src: ['*.js'], expand: true }
        ]
      },
      'docs-style': { dest: 'demo/assets/css/', cwd: 'dist/', src: ['*.css'], expand: true },
      'docs-scripts': { dest: 'demo/scripts/', cwd: 'dist/', src: ['*.js'], expand: true }
    },

    imagemin: {
      docs: {
        options: { optimizationLevel: 3 },
        files: [
          { dest: 'demo/assets/ico/', cwd: 'docs/ico/', src: ['*.{png,jpg,gif}'], expand: true },
          { dest: 'demo/assets/images/', cwd: 'docs/images/', src: ['*.{png,jpg,gif}'], expand: true }
        ]
      }
    },

    less: {
      options: {
        paths: ['src/less/'],
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: ['src/less/app.less'],
        dest: 'dist/<%= filename %>-<%= pkg.version %>.css'
      },
      customizer: {
        src: ['<%= customStyleFile %>'],
        dest: 'dist/<%= filenamecustom %>-<%= pkg.version %>.css'
      },

      docs: {
        options: {
          paths: ['docs/less/'],
          compress: true,
          yuicompress: true
        },
        src: ['<%= customStyleFile %>'],
        dest: 'demo/assets/css/<%= filename %>-<%= pkg.version %>.docs.min.css'
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
        dest: '_build/scripts/tpls/',
        cwd: 'src/scripts/tpls/',
        src: ['**/*.jade'],
        ext: '.html.js',
        expand: true
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
        src: ['demo/scripts/**', 'demo/assets/css/**']
      }
    },

    jade: {
      dist: {
        dest: 'dist/tpls/',
        cwd: 'src/scripts/tpls/',
        src: ['*/*.jade'],
        ext: '.html',
        expand: true
      },

      docs: {
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
        dest: 'demo/',
        cwd: 'docs/jade/pages/',
        src: ['*.jade'],
        ext: '.html',
        expand: true
      },
      'docs-template': {
        options: '<%= jade.docs.options %>',
        dest: 'demo/assets/templates/',
        cwd: 'docs/jade/templates/',
        src: ['*/*.jade'],
        ext: '.html',
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
      },

      // docs compile
      docs: {
        src: ['docs/scripts/app/partials/*.js', 'docs/scripts/app/pages/*.js'],
        dest: 'demo/scripts/<%= filename %>-<%= pkg.version %>.docs.js'
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
      },

      // docs compression
      docs: {
        src: ['<%= concat.docs.dest %>'],
        dest: 'demo/scripts/<%= filename %>-<%= pkg.version %>.docs.min.js'
      }
    },

    // TODO: unit test.
    watch: {
      'dist-less': {
        files: ['src/less/**'],
        tasks: ['build-style-customizer', 'copy:docs-style']
      },
      'dist-scripts': {
        files: ['src/scripts/**'],
        tasks: ['build-script-customizer', 'copy:docs-scripts']
      },

      'docs-jade': {
        files: ['docs/jade/**'],
        tasks: ['jade:docs', 'jade:docs-template']
      },
      'docs-less': {
        files: ['docs/less/**'],
        tasks: ['build-style-docs']
      },
      'docs-scripts': {
        files: ['docs/scripts/**'],
        tasks: ['build-script-docs']
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
      // Strategy: find where module is declared,
      // and from there get everything inside the [] and split them by comma
      var moduleDeclIndex = contents.indexOf('angular.module(');
      var depArrayStart = contents.indexOf('[', moduleDeclIndex);
      var depArrayEnd = contents.indexOf(']', depArrayStart);
      var dependencies = contents.substring(depArrayStart + 1, depArrayEnd);
      dependencies.split(',').forEach(function(dep) {
        if (dep.indexOf('ui.') > -1) {
          var depName = dep.trim().replace('ui.','').replace(/['"]/g,'');
          if (deps.indexOf(depName) < 0) {
            deps.push(depName);
            // Get dependencies for this new dependency
            deps = deps.concat(dependenciesForModule(depName));
          }
        }
      });
    });
    return deps;
  }

  var foundStyleComponents = {};
  function findStyle(file) {
    if (foundStyleComponents[file]) return;
    foundStyleComponents[file] = true;

    var module = {
      name:     path.basename(file),
      import:   '@import ' + enquote(file.replace(grunt.config('less.options.paths')[0], '')) + ';',
      file:     file + '.less'
    };

    grunt.file.exists(module.file) && grunt.config('styles.modules', grunt.config('styles.modules').concat(module));
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

  // task for building customizer
  grunt.registerTask('build-style-customizer', 'Add style files to customizer.', function() {
    var _ = grunt.util._;
    grunt.file.expand(['src/less/components/*.less'])
    .forEach(function(file) {
      findStyle(file.replace(path.extname(file), ''));
    });

    var modules = grunt.config('styles.modules'),
    imports = _.pluck(modules, 'import'),
    moduleName = _.pluck(modules, 'name'),
    index = 0;

    var args = this.args;
    if (args.length) {
      var source = grunt.file.read('src/less/app.less'),
      index;

      args.forEach(function(module) {
        index = moduleName.indexOf(module);
        -1 !== index && imports.splice(index, 1);
      });

      imports.forEach(function(filter) {
        source = source.replace(filter, '');
      });

      grunt.file.write(grunt.config('customStyleFile'), source);
      grunt.task.run(['less:customizer', 'cssmin:customizer', 'clean:build']);
    }
    else grunt.task.run(['less:dist', 'cssmin:dist', 'clean:build']);
  });

  grunt.registerTask('_build-script-customizer', 'Add scripts files to customizer.', function() {
    var _ = grunt.util._;
    if (this.args.length) {
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
    grunt.config('concat.dist.src', grunt.config('concat.dist.src').concat(srcFiles));
    grunt.config('concat.distTpls.src', grunt.config('concat.distTpls.src').concat(srcFiles).concat(tpljsFiles));
    grunt.task.run(['concat:dist', 'concat:distTpls', 'uglify:dist', 'uglify:distTpls', 'clean:build']);
  });

  grunt.registerTask('build-script-customizer', 'Add scripts files to customizer.', function() {
    var args = this.args.length ? ':' + this.args.join(':') : '';
    grunt.task.run(['jade:dist', 'html2js:dist', '_build-script-customizer' + args, 'clean:build']);
  });

  // task for building docs
  grunt.registerTask('build-style-docs', 'Add style files to docs.', function() {
    var _ = grunt.util._;
    grunt.config('styles.modules', []);
    grunt.file.expand(['docs/less/pages/*/*.less', 'docs/less/pages/*/*/*.less'])
    .forEach(function(file) {
      findStyle(file.replace(path.extname(file), ''));
    });

    var modules = grunt.config('styles.modules'),
    imports = _.pluck(modules, 'import'),
    moduleName = _.pluck(modules, 'name'),
    index = 0;

    var source = grunt.file.read('docs/less/app.less');
    source += ('\n\n\/\/ Pages\n' + imports.join('\n'));

    grunt.file.write(grunt.config('customStyleFile'), source);
    grunt.task.run(['less:docs', 'clean:build']);
  });

  grunt.registerTask('build-script-docs', ['concat:docs', 'uglify:docs', 'clean:build']);

  // task's groups
  var buildTasks = ['clean', 'build-full', 'copy:docs', 'imagemin:docs', 'build-style-docs', 'html2js:dist', 'build-script-docs'];
  grunt.registerTask('build-full', ['build-style-customizer', 'build-script-customizer']);
  grunt.registerTask('build-dev', buildTasks.concat(['jade:docs', 'jade:docs-template', 'clean:build', 'watch']));
  grunt.registerTask('build-release', buildTasks.concat(['hashmap:docs', 'jade:docs', 'jade:docs-template', 'clean:build']));
  grunt.registerTask('default', ['build-dev']);
};