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

    stateFile: '<%= buildPath %>/grunt.state.json',

    clean: {
      build: '<%= buildPath %>',
      dist: 'assets'
    },

    bower: {
      dist: {
        dest: 'assets/',
        js_dest: 'assets/scripts/',
        css_dest: 'assets/styles/',
        fonts_dest: 'assets/fonts/',
        less_dest: 'client/styles/',
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
                'dist/js/*.js',
                'dist/fonts/*.{eot,svg,ttf,woff,woff2}',
                'dist/css/*.css'
              ]
            },
            'font-awesome': {
              keepExpandedHierarchy: true,
              stripGlobBase: true,
              files: [
                'css/*.css',
                'fonts/*.{eot,svg,ttf,woff,woff2}'
              ]
            },
            'lesshat': {
              keepExpandedHierarchy: true,
              stripGlobBase: true,
              less_dest: 'client/public/styles/mixins',
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
        src: 'client/public/panels/sprites/*.png',
        dest: '<%= spritesImageFile %>',
        destCss: '<%= spritesLessFile %>',
        padding: 10,
        cssFormat: 'less',
        cssTemplate: 'client/public/panels/sprites.less.mustache',
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
        cwd: 'client/panels/',
        src: ['*.{png,jpg,gif}'],
        dest: 'assets/panels/',
        expand: true,
      }
    },

    copy: {
      assets: {
        cwd: 'client/public/',
        dest: 'assets/',
        src: ['audio/**', 'fonts/**', 'panels/*.{png,jpg,gif,ico}'],
        expand: true
      }
    },

    less: {
      options: {
        compress: true,
        yuicompress: true,
        sourceMap: true,
        outputSourceFiles: true,
        paths: ['./', 'client/public/styles/'],
      },
      public: {
        options: {
          banner: '/* <%= pkg.name %>.css#<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n',
          sourceMapFilename: 'assets/styles/main/<%= name %>.min.css.map',
        },
        src: ['<%= buildPath %>/styles/bootstrap.less'],
        dest: 'assets/styles/main/<%= name %>.min.css',
      }
    },

    scripts: {
      srcModules: [],
      srcFiles: [],
    },

    // html|jade|exjs|haml to angular module.
    html2js: {
      ui: {
        options: {
          useStrict: true,
          base: 'client/public/scripts/ui/template',
          module: null,
          rename: function(name) {
            return 'template/' + name.replace(path.extname(name), '.html');
          }
        },
        dest: '<%= buildPath %>/scripts/ui/template',
        cwd: 'client/public/scripts/ui/template',
        src: ['**/*.jade'],
        ext: '.html.js',
        expand: true
      }
    },

    concat: {
      options: {
        separator: ';'
      },
      public: {
        options: {
          banner: '// <%= pkg.name %>.js#<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n',
        },
        src: ['<%= scripts.srcFiles %>'],
        dest: 'assets/scripts/main/<%= name %>.js',
      }
    },

    uglify: {
      options: {
        sourceMap: true,
      },
      public: {
        options: {
          banner: '// <%= pkg.name %>.min.js#<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n',
        },
        src: ['<%= concat.public.dest %>'],
        dest: 'assets/scripts/main/<%= name %>.min.js',
      },
      app: {
        dest: 'assets/scripts/main/apps/',
        cwd: 'assets/scripts/main/apps/',
        src: ['*.js'],
        expand: true,
      },
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
            pkg: grunt.config('pkg'),
            makeVersion: makeVersion,
            PUBLIC: 'client/public/templates/',
          }
        }
      },
      templates: {
        dest: 'assets/templates/',
        cwd: 'client/apps/',
        src: ['*/templates/*.jade'],
        ext: '.html',
        expand: true,
        rename: function(distPath, filePath, options) {
          var map = filePath.split('/')
              , app = map.shift()
              , name = path.basename(filePath)

          return distPath + app + '/' + name;
        }
      }
    },

    jshint: {
      options: {
        jshintrc: true,
      },
      gruntfile: {
        src: './Gruntfile.js',
      },
      scripts: {
        src: ['client/public/scripts/**/*.js', 'client/apps/**/scripts/*.js'],
      },
    },

    karma: {
      public: {
        configFile: 'karma.conf.js',
      }
    },

    shell: {
      grunt: {
        command: 'npm install',
      },
      bower: {
        command: 'bower install',
      },
    },

    watch: {
      'config-package': {
        options: {
          event: ['added', 'changed'],
        },
        files: ['package.json'],
        tasks: ['shell:grunt', '<%= environment === "DEVELOPMENT" ? "development" : "production" %>']
      },
      'config-bower': {
        options: {
          event: ['added', 'changed'],
        },
        files: ['bower.json'],
        tasks: ['shell:bower', 'bower']
      },
      'config-gruntfile': {
        options: {
          event: ['added', 'changed'],
          reload: true,
          spawn: false,
        },
        files: ['Gruntfile.js'],
        tasks: ['<%= environment === "DEVELOPMENT" ? "development" : "production" %>']
      },

      'style-all': {
        options: {
          event: ['added', 'deleted']
        },
        files: ['client/public/styles/**', 'client/apps/*/styles/*/*.less'],
        tasks: ['lessToCss']
      },
      'style-public': {
        options: {
          event: ['changed'],
        },
        files: ['client/public/styles/**'],
        tasks: ['less:public']
      },

      'script-all': {
        options: {
          event: ['added', 'deleted'],
        },
        files: ['client/public/scripts/*/*.js', 'client/apps/*/scripts/*/*.js'],
        tasks: ['concatJS']
      },
      'script-public': {
        options: {
          event: ['changed'],
        },
        files: ['client/public/scripts/*/*.js'],
        tasks: ['concat:public']
      },
    },
  })

  // Merge Tasks
  // ================

  /**
   * This task will 
   */
  grunt.registerTask('lessToCss', 'Find the style file and compile them to css.', function() {
    var bootstrapFile = grunt.config('buildPath') + '/styles/bootstrap.less'
        , modules

    // Public style
    modules = findLesses(grunt.file.expand([
      'client/public/styles/variables/**/*.less'
      , 'client/public/styles/mixins/**/*.less'
      , 'client/public/styles/resets/**/*.less'
      , 'client/public/styles/core/**/*.less'
      , 'client/public/styles/effects/**/*.less'
      , 'client/public/styles/utilities/**/*.less'
      , 'client/public/styles/components/**/*.less'
      , grunt.config('spritesLessFile')
    ]))

    grunt.file.write(bootstrapFile,
      _.pluck(modules, 'srcFile')
      .map(function(file) {
        grunt.log.writeln('File ' + file.cyan + ' imported.')
        return '@import ' + enquote(file) + ';'
      })
      .join('\n'))

    // App style
    grunt.file
    .expand('client/apps/*')
    .forEach(function(dir) {
      var stats = fs.lstatSync(dir)
          , name = dir.split('/').splice(-1, 1)[0]
          , bootstrapFile = grunt.config('buildPath') + '/styles/apps/' + name + '.less'

      if (!stats.isDirectory()) {
        return
      }

      var modules = findLesses(grunt.file.expand(dir + '/styles/*.less'))
      grunt.file.write(bootstrapFile,
        _.pluck(modules, 'srcFile')
        .map(function(file) {
          grunt.log.writeln('File ' + file.cyan + ' imported.')
          return '@import ' + enquote(file) + ';'
        })
        .join('\n'))

      // Extend jade task.
      grunt.config('less.$' + name, {
        options: _.extend(grunt.config('less.options'), {
          banner: '/* ' + name + '.css#<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n',
          sourceMapFilename: 'assets/styles/main/apps/' + name + '.min.css.map',
        }),
        src: ['<%= buildPath %>/styles/apps/' + name + '.less'],
        dest: 'assets/styles/main/apps/' + name + '.min.css',
      })

      // Extend watch task.
      grunt.config('watch.style-$' + name, {
        options: {
          event: ['changed'],
        },
        files: ['client/apps/' + name + '/styles/**'],
        tasks: ['loadState', 'less:$' + name]
      })
    })
  
    grunt.task.run(['less', 'saveState'])
  })

  /**
   * This task will concat js file not include the controller-files,
   * only the commmon modules. It will depend on the controllers'
   * dependencies to find out the module and js file which
   * was imported from controllers. But it would copy
   * the controller-file to dest yet.
   */
  grunt.registerTask('concatJS', 'According to dependencies, merge and sort the angularjs files.', function() {
    var appModules = []
        , cmmModules = []
        , tplModules = []
        , uiModules = []

    /**
     * Import controller modules from controller's files.
     * It will read the file and find out their dependencies.
     */
    var appFiles = []
        , appDeps = []

    appFiles = grunt.file
    .expand('client/apps/*/scripts/*.js')
    .map(function(regexp) {
      return grunt.config.process(regexp)
    })

    cmmModules = findScripts(appFiles, { isRoot: true })
    .filter(function(module) {
      if (-1 === appFiles.indexOf(module.srcFile)) {
        return true
      }
      else {
        appModules.push(module)
        return false
      }
    })

    // Find out all dependencies.
    _.pluck(appModules, 'dependencies')
    .forEach(function(deps) {
      if (deps.length > 0) {
        appDeps = appDeps.concat(deps)
      }
    })

    // Unique the same modules
    appDeps = underscore.unique(appDeps)

    /**
     * Find out all the angular ui tempalte file.
     * Compile them to angular modules and save to the tmp path.
     */
    tplModules = grunt.file
    .expand('client/public/scripts/ui/template/*/*.jade')
    .map(function(filePath) {
      var file = path.basename(filePath).replace(path.extname(filePath), '.html')
          , relativePath = path.dirname(filePath).split('/').pop() + '/' + file
          , name = 'template/' + relativePath
          , moduleName = enquote(name)
          , srcFile = grunt.config('buildPath') + '/scripts/ui/template/' + relativePath + '.js'

      return { name: name, moduleName: moduleName, srcFile: srcFile }
    })
    .filter(function(module) {
      return -1 !== appDeps.indexOf(module.name)
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

    /**
     * Add app file concat task and add a watching task.
     */
    var appSortedModules = {}

    appModules
    .forEach(function(module) {
      var name = path
          .dirname(module.srcFile)
          .split('\/')
          .slice(2,3)[0]

      if (!appSortedModules[name]) {
        appSortedModules[name] = []
      }

      appSortedModules[name].push(module)
    })

    var name = ''
    for (name in appSortedModules) {
      // Extend concat task.
      grunt.config('concat.$' + name, {
        options: {
          banner: '// ' + name + '.js#<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n',
        },
        src: appSortedModules[name]
          .map(function(app) {
            return app.srcFile
          }),
        dest: 'assets/scripts/main/apps/' + name + '.js',
      })

      // Extend watch task.
      grunt.config('watch.script-$' + name, {
        options: {
          event: ['changed'],
        },
        files: ['client/apps/' + name + '/scripts/**'],
        tasks: ['loadState', 'concat:$' + name]
      })
    }

    // Run the concat task.
    grunt.task.run(['concat', 'saveState'])
  })

  /**
   * This task will 
   */
  grunt.registerTask('compileJade', 'Find the jade file and watch them in each app.', function() {
    grunt.file
    .expand('client/apps/*/')
    .forEach(function(dir) {
      var stats = fs.lstatSync(dir)
          , name = dir.split('/').splice(-2, 1)[0]

      if (!stats.isDirectory()) {
        return
      }

      // Extend jade task.
      grunt.config('jade.$' + name, {
        dest: 'assets/' + name + '.html',
        src: 'client/apps/' + name + '/index.jade'
      })

      // Extend watch task.
      grunt.config('watch.layout-$' + name, {
        options: {
          event: ['changed'],
        },
        files: [dir + '*.jade', dir + 'templates/**'],
        tasks: ['loadState', 'jade:$' + name]
      })
    })

    grunt.task.run(['jade', 'saveState'])
  })

  grunt.registerTask('loadState', 'Load grunt\'s config from json file and merge them.', loadState)
  grunt.registerTask('saveState', 'Save grunt config state to json file.', saveState)

  grunt.registerTask('kill', 'Kill the all child process.', function() {
    // TODO: kill all child process.
    // process.exit(1)
  })

  grunt.registerTask('assets', ['bower', 'copy:assets', 'sprite', 'imagemin'])
  grunt.registerTask('styles',  ['lessToCss'])
  grunt.registerTask('scripts', ['html2js', 'concatJS'])
  grunt.registerTask('layouts', ['compileJade'])
  grunt.registerTask('default', ['development'])

  grunt.registerTask('test-config', 'Task for test the grunt file.', function() {
    grunt.task.run(['jshint:gruntfile'])
  })

  /**
   * If you in development. You can only run development task.
   * It will only concat the file, run the unit-test. It will not to
   * compress the files.
   */
  grunt.registerTask('development', 'Task for develop environment.', function() {
    timer.init(grunt)

    grunt.config('environment', 'DEVELOPMENT')

    grunt.config('less.options', _.extend(grunt.config('less.options'), {
      compress: false,
      yuicompress: false,
      sourceMap: false,
      outputSourceFiles: false
    }))

    grunt.task.run(['clean', 'assets', 'styles', 'scripts', 'layouts', 'watch'])
  })

  /**
   * Task for release a new version.
   */
  grunt.registerTask('release', 'Task for jshint test and unit test before release a new version.', function() {
    grunt.task.run(['clean', 'test-config', 'clean', 'assets', 'styles', 'scripts', 'uglify', 'karma:release', 'hashmap', 'layouts'])
  })

  /**
   * Production task, it is fully task to run the project.
   * Watch the file, run the unit-test task, concat and compress files, etc.
   */
  grunt.registerTask('production', 'Task for product environment.', function() {
    grunt.config('environment', 'PRODUCTION')
    grunt.task.run(['test-config', 'clean', 'assets', 'styles', 'scripts', 'uglify', 'hashmap', 'layouts', 'watch'])
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
        dir = filePath.replace(regexp, '');
        extname = /[.]/.exec(filePath) ? /[^.]+$/.exec(filePath) : undefined;
        name = token.replace(new RegExp('.' + extname + '$'), '');
        version = map[token];                  
        return dir + name + '.' + version + '.' + extname
      }
    }

    return filePath;
  }

  function findLesses(args, options) {
    var modules = []
        , existsModules = {}

    args.forEach(findLessModule)

    return modules

    function findLessModule(filePath) {
      var name = path
            .basename(filePath)
            .replace(path.extname(filePath), '')

      if (existsModules[name]) {
        return
      }

      existsModules[name] = true

      var module = {
        name: name
        , moduleName: enquote(name)
        , displayName: ucwords(breakup(name, ' '))
        , srcFile: filePath
        , dependencies: dependenciesForModule(filePath)
      }

      if (fs.existsSync(module.srcFile)) {
        module
        .dependencies
        .forEach(function(dep) {
          var arr = dep.split('.')
          arr.length > 1 && findLessModule('client/public/styles/' + arr.join('/') + '.js')
        })

        modules = modules.concat(module)
      }
    }

    function dependenciesForModule(filePath) {
      return []
    }
  }

  function findScripts(args, options) {
    options = options || {}

    var modules = []
        , existsModules = {}

    args.forEach(function(filePath) {
      findScriptModules(filePath, options)
    })

    return modules

    function findScriptModules(filePath, options) {
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
        module
        .dependencies
        .forEach(function(dep) {
          var arr = dep.split('.')
          arr.length > 1 && findScriptModules('client/public/scripts/' + arr.join('/') + '.js', { isRoot: false })
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

  /**
   * As the watch task, grunt will read the origin config,
   * so we must save the state of the config to build our
   * project. 
   */
  function saveState() {
    var config = JSON.stringify(grunt.config())
    grunt.file.write(grunt.config('stateFile'), config)
  }

  function loadState() {
    var config = grunt.file.readJSON(grunt.config('stateFile'))
    grunt.config.merge(config)
  }
}
