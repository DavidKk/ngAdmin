module.exports = function(grunt) {
  'use strict'

  // Import the modules which is necessary.
  var fs = require('fs')
      , path = require('path')
      , underscore = require('underscore')
      , timer = require('grunt-timer')
      , _ = grunt.util._

  // Load the plugin
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-imagemin')
  grunt.loadNpmTasks('grunt-contrib-jade')
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-hashmap')
  grunt.loadNpmTasks('grunt-spritesmith')
  grunt.loadNpmTasks('grunt-html2js')
  grunt.loadNpmTasks('grunt-bower')
  grunt.loadNpmTasks('grunt-shell')
  grunt.loadNpmTasks('grunt-karma')

  // Configuring
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    name: '<%= pkg.name.replace(/^[A-Z]/, function(str) { return str.toLowerCase(); }) %>',
    environment: 'DEVELOPMENT',

    buildPath: './.build',
    browserPath: './bower_components',

    hashmapFile: 'assets/hashmap/version.json',
    spritesImageFile: 'assets/panels/sprites.png',
    spritesLessFile: '<%= buildPath %>/styles/sprites.less',

    clean: {
      build: '<%= buildPath %>',
      dist: 'assets'
    },

    bower: {
      dist: {
        dest: 'assets/',
        js_dest: 'assets/scripts',
        css_dest: 'assets/styles',
        fonts_dest: 'assets/fonts',
        less_dest: 'client/styles',
        /**
         * Modify options what you want to import.
         */
        options: {
          expand: true,
          ignorePackages: [
            'jquery'
          ],
          packageSpecific: {
            'bootstrap': {
              keepExpandedHierarchy: true,
              stripGlobBase: true,
              files: [
                'dist/scripts/*.js',
                'dist/fonts/*.{eot,svg,ttf,woff,woff2}',
                'dist/styles/*.css'
              ]
            },
            'lesshat': {
              keepExpandedHierarchy: true,
              stripGlobBase: true,
              less_dest: 'client/styles/mixins',
              files: [
                'build/*.less'
              ]
            },
            'script': {
              keepExpandedHierarchy: true,
              stripGlobBase: true,
              files: [
                'dist/*.js'
              ]
            }
          }
        }
      }
    },

    /**
     * Make the sprite picture from all IMG-files which in `src` path..
     */
    sprite: {
      dist: {
        src: 'client/panels/sprites/*.png',
        dest: '<%= spritesImageFile %>',
        destCss: '<%= spritesLessFile %>',
        padding: 10,
        cssFormat: 'less',
        cssTemplate: 'client/panels/sprites.less.mustache',
        cssVarMap: function(sprite) {
          sprite.name = 'sp-' + sprite.name;
        },
        cssOpts: {
          basepath: '../../panels/sprites.png',
          functions: true
        }
      }
    },

    imagemin: {
      dist: {
        options: {
          optimizationLevel: 3
        },
        expand: true,
        cwd: 'client/panels/',
        src: ['*.{png,jpg,gif}'],
        dest: 'assets/panels/'
      }
    },

    copy: {
      assets: {
        cwd: 'client/',
        dest: 'assets/',
        src: ['audio/**', 'fonts/**'],
        expand: true
      },
      scripts: {
        cwd: 'client/scripts/modules/',
        dest: 'assets/scripts/main/modules/',
        src: ['*.js'],
        expand: true
      }
    },

    less: {
      options: {
        compress: true,
        yuicompress: true,
        sourceMap: true,
        outputSourceFiles: true,
        paths: ['./', 'less/']
      },
      dist: {
        options: {
          banner: '/* <%= pkg.name %>.css#<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n',
          sourceMapFilename: 'assets/styles/main/<%= name %>.min.css.map'
        },
        src: ['<%= buildPath %>/styles/bootstrap.less'],
        dest: 'assets/styles/main/<%= name %>.min.css'
      },
      modules: {
        cwd: '<%= buildPath %>/styles/modules/',
        src: ['*/main.less', '*/desktop.less', '*/tablet.less', '*/mobile.less', '*.less'],
        dest: 'assets/styles/main/'
      }
    },

    scripts: {
      meta: {
        banner: '// <%= pkg.name %>.js#<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n'
      },
      modules: 'angular.module("<%= name %>", [<%= scripts.srcModules %>]);',
      srcModules: [],
      srcFiles: []
    },

    // html|jade|exjs|haml to angular module.
    html2js: {
      dist: {
        options: {
          useStrict: true,
          base: 'client/scripts/ui/template',
          module: null,
          rename: function(name) {
            return 'template/' + name.replace(path.extname(name), '.html');
          }
        },
        dest: '<%= buildPath %>/scripts/ui/template',
        cwd: 'client/scripts/ui/template',
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
          banner: '<%= scripts.meta.banner %><%= scripts.modules %>'
        },
        src: ['<%= scripts.srcFiles %>'],
        dest: 'assets/scripts/main/<%= name %>.js'
      }
    },

    uglify: {
      dist: {
        options: {
          sourceMap: true
        },
        src: ['<%= concat.dist.dest %>'],
        dest: 'assets/scripts/main/<%= name %>.min.js'
      }
    },

    hashmap: {
      options: {
        keep: true,
        output: '<%= hashmapFile %>',
        rename: '#{= dirname}/#{= basename}.#{= hash}#{= extname}'
      },

      dist: {
        dest: './',
        cwd: './',
        src: [
          'assets/scripts/*/*.js',
          'assets/styles/*/*.css',
          'assets/fonts/*/*.{eot,svg,ttf,woff,woff2}',
          'assets/panels/*/*.{png,jpg,gif}'
        ]
      }
    },

    jade: {
      options: {
        data: function() {
          return {
            pkg: grunt.config('pkg')
            , makeVersion: makeVersion
          }
        }
      },
      dist: {
        expand: true,
        dest: 'assets/templates/',
        cwd: 'client/templates/',
        src: ['*.jade'],
        ext: '.html'
      }
    },

    jshint: {
      options: {
        jshintrc: true
      },
      gruntfile: {
        src: './Gruntfile.js'
      },
      scripts: {
        src: 'client/scripts/**/*.js'
      }
    },

    shell: {
      grunt: {
        command: [
          'npm i'
        ].join('\n')
      },
      bower: {
        command: [
          'bower install'
        ].join('\n')
      }
    },

    karma: {
      dest: {
        configFile: 'karma.conf.js'
        
      }
    },

    watch: {
      gruntfile: {
        options: {
          reload: true
        },
        files: ['Gruntfile.js'],
        tasks: ['<%= environment === "DEVELOPMENT" ? "development" : "production" %>']
      },
      grunt: {
        files: ['package.json'],
        tasks: ['shell:grunt', '<%= environment === "DEVELOPMENT" ? "development" : "production" %>']
      },
      bower: {
        files: ['bower.json'],
        tasks: ['shell:bower', 'bower']
      },
      styles: {
        files: ['client/styles/**'],
        tasks: ['lessToCss']
      },
      scripts: {
        files: ['client/scripts/**'],
        tasks: ['concatJS']
      },
      jade: {
        files: ['client/templates/**'],
        tasks: ['layouts']
      }
    }
  })

  // Merge Tasks
  // ====================

  /**
   * This task can compile common LESS to one css file,
   * but that css file docs not include LESS file of each
   * page. But it would complile the LESS file for each page.
   */
  grunt.registerTask('lessToCss', 'Find the style file and compile them to css.', function() {
    var bootstrapFile = grunt.config('buildPath') + '/styles/bootstrap.less'
        , modules = []

    modules = grunt.file.expand([
      grunt.config('spritesLessFile')
      , 'client/styles/variables/**/*.less'
      , 'client/styles/mixins/**/*.less'
      , 'client/styles/resets/**/*.less'
      , 'client/styles/core/**/*.less'
      , 'client/styles/effects/**/*.less'
      , 'client/styles/utilities/**/*.less'
      , 'client/styles/components/**/*.less'
      , 'client/styles/script-components/**/*.less'
    ])
    .map(findStyle)

    grunt.file.write(bootstrapFile,
      _.pluck(modules, 'srcFile')
      .map(function(file) {
        grunt.log.writeln('File ' + file.cyan + ' imported.')
        return '@import ' + enquote(file) + ';'
      })
      .join('\n'))

    grunt.task.run(['less:dist', 'less:modules'])
  })

  /**
   * This tasks concat js file not include the controller-files,
   * only the commmon modules. It will depend on the controllers'
   * dependencies to find out the module and js file which
   * was imported from controllers. But it would copy
   * the controller-file to dest yet.
   */
  grunt.registerTask('concatJS', 'According to dependencies, merge and sort the angularjs files.', function() {
    var cmmModules = []
        , tplModules = []
        , ctrlModules = []
        , uiModules = []

    /**
     * Import controller modules from controller's files.
     * It will read the file and find out their dependencies.
     */
    var ctrlFiles = []
        , cmmDeps = []

    ctrlFiles = grunt.file.expand('client/scripts/modules/*.js')
    .map(function(regexp) {
      return grunt.config.process(regexp)
    })

    cmmModules = findScripts(ctrlFiles, { isRoot: false })
    .filter(function(module) {
      if (-1 === ctrlFiles.indexOf(module.srcFile)) {
        return true
      }
      else {
        ctrlModules.push(module);
        return false
      }
    })

    // Find out all dependencies.
    _.pluck(cmmModules, 'dependencies')
    .forEach(function(deps) {
      if (deps.length > 0) {
        cmmDeps = cmmDeps.concat(deps)
      }
    })

    // Unique the same modules
    cmmDeps = underscore.unique(cmmDeps)

    /**
     * Find out all the angular ui tempalte file.
     * Compile them to angular modules and save to the tmp path.
     */
    tplModules = grunt.file.expand('client/scripts/ui/template/**/*.jade')
    .map(function(filePath) {
      var file = path.basename(filePath).replace(path.extname(filePath), '.html')
          , relativePath = path.dirname(filePath).split('/').pop() + '/' + file
          , name = 'template/' + relativePath
          , moduleName = enquote(name)
          , srcFile = grunt.config('buildPath') + '/scripts/ui/template/' + relativePath + '.js'

      return { name: name, moduleName: moduleName, srcFile: srcFile }
    })
    .filter(function(module) {
      return -1 !== cmmDeps.indexOf(module.name)
    })

    // Pakage configure & Run concat task
    var modules = cmmModules.concat(tplModules)
        , srcModules = _.pluck(modules, 'moduleName')
        , srcFiles = _.pluck(modules, 'srcFile')

    srcFiles
    .forEach(function(file) {
      grunt.log.writeln('File ' + file.cyan + ' imported.')
    })

    grunt.config('scripts.srcModules', srcModules)
    grunt.config('scripts.srcFiles', srcFiles)
    grunt.task.run(['concat', 'copy:scripts']);
  })

  grunt.registerTask('assets', ['copy:assets', 'sprite', 'imagemin', 'bower'])
  grunt.registerTask('styles',  ['lessToCss'])
  grunt.registerTask('scripts', ['jshint:scripts', 'html2js', 'concatJS'])
  grunt.registerTask('layouts', ['jade'])
  grunt.registerTask('default', ['development'])

  /**
   * If you in development. You can only run development task.
   * It will only concat the file, run the unit-test. It will not to
   * compress the files.
   */
  grunt.registerTask('development', 'Tasks in develop environment.', function() {
    timer.init(grunt)

    grunt.config('environment', 'DEVELOPMENT')

    grunt.config('less.options', {
      compress: false,
      yuicompress: false,
      sourceMap: false,
      outputSourceFiles: false
    })

    grunt.task.run(['assets', 'styles', 'scripts', 'layouts', 'watch'])
  })

  grunt.registerTask('testing', 'Tasks in unit test.', function() {
    grunt.task.run(['jshint:gruntfile'])
  })

  /**
   * Production task, it is fully task to run the project.
   * Watch the file, run the unit-test task, concat and compress files, etc.
   */
  grunt.registerTask('production', 'Tasks in product environment.', function() {
    grunt.config('environment', 'PRODUCTION')
    grunt.task.run(['testing', 'clean', 'assets', 'styles', 'scripts', 'uglify', 'hashmap', 'layouts', 'watch'])
  })

  // Helpers
  // ==========================

  function makeVersion(filePath) {
    var mapFilePath = grunt.config('hashmapFile')
        , map
        , token
        , regexp
        , extname
        , dir
        , name
        , version

    if (grunt.file.exists(mapFilePath)) {
      map = grunt.file.readJSON(mapFilePath)
    }

    for (token in map) {
      regexp = new RegExp(token + '$')

      if (regexp.test(filePath)) {
        dir = file.replace(regexp, '');
        extname = /[.]/.exec(file) ? /[^.]+$/.exec(file) : undefined;
        name = token.replace(new RegExp('.' + extname + '$'), '');
        version = map[token];                  
        return dir + name + '.' + version + '.' + extname
      }
    }

    return filePath;
  }

  function findStyle(filePath) {
    var dir = path.dirname(filePath)
        , name = path.basename(filePath).replace(path.extname(filePath), '')

    return {
      name: name
      , moduleName: enquote(name)
      , displayName: ucwords(breakup(name, ' '))
      , srcFile: filePath
    }
  }

  function findScripts(args, options) {
    options = options || {}

    var modules = []
        , existsModules = {}

    args.forEach(findScriptModules)
    return modules

    function findScriptModules(filePath) {
      var name = path.basename(filePath)
            .replace(path.extname(filePath), '')

          , moduleName = options.isRoot
            ? name
            : filePath
              .split('/')
              .splice(-2, 2)
              .join('.')
              .replace(path.extname(filePath), '')

      if (existsModules[name]) {
        return
      }

      existsModules[name] = true

      var module = {
        name: name
        , displayName: ucwords(breakup(name, ' '))
        , moduleName: enquote(moduleName)
        , srcFile: filePath
        , dependencies: dependenciesForModule(filePath)
      }

      if (fs.existsSync(module.srcFile)) {
        module.dependencies
        .forEach(function(dep) {
          var arr = dep.split('.')
          arr.length > 1 && findScriptModules('client/scripts/' + arr.join('/') + '.js')
        })

        modules = modules.concat(module)
      }
    }

    function dependenciesForModule(filePath) {
      if (fs.existsSync(filePath)) {
        var contents = grunt.file.read(filePath)
            , moduleDeclIndex = contents.indexOf('angular.module(')
            , depArrayStart = contents.indexOf('[', moduleDeclIndex)
            , depArrayEnd = contents.indexOf(']', depArrayStart)
            , depText = contents.substring(depArrayStart + 1, depArrayEnd)

        if ('' !== depText) {
          return depText.replace(/[\'\s]/g, '').split(',')
        }
      }

      return []
    }
  }

  function enquote(str) {
    return '"' + str + '"'
  }

  function breakup(text, separator) {
    return text.replace(/[A-Z]/g, function(match) {
      return separator + match
    })
  }

  function ucwords(text) {
    return text.replace(/^([a-z])|\s+([a-z])/g, function($1) {
      return $1.toUpperCase()
    })
  }
}