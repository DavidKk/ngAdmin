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
  grunt.loadNpmTasks('grunt-favicons')
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

    buildPath: '.build',
    browserPath: 'bower_components',

    stylePublicPath: 'client/public/styles',
    styleDistPath: 'assets/styles',

    scriptPublicPath: 'client/public/scripts',
    scriptDistPath: 'assets/scripts',

    hashmapFile: 'assets/hashmap/version.json',
    spriteImageFile: 'assets/panels/sprites.png',
    spriteLessFile: '<%= buildPath %>/styles/sprites.less',

    stateFile: '<%= buildPath %>/grunt.state.json',

    clean: {
      build: '<%= buildPath %>',
      dist: 'assets',
    },

    bower: {
      dist: {
        dest: 'assets/',
        js_dest: 'assets/scripts',
        css_dest: 'assets/styles',
        fonts_dest: 'assets/fonts',

        less_dest: 'client/public/styles',
        /**
         * Modify options what you want to import.
         */
        options: {
          expand: true,
          ignorePackages: [
            'jquery'
          ],
          packageSpecific: {
            'font-awesome': {
              keepExpandedHierarchy: true,
              stripGlobBase: true,
              files: [
                'css/*.css',
                'fonts/*.{eot,svg,ttf,woff,woff2}',
              ]
            },
            'bootstrap': {
              keepExpandedHierarchy: true,
              stripGlobBase: true,
              files: [
                'dist/scripts/*.js',
                'dist/fonts/*.{eot,svg,ttf,woff,woff2}',
                'dist/css/*.css'
              ]
            },
            'iscroll': {
              keepExpandedHierarchy: true,
              stripGlobBase: true,
              files: [
                'build/*.js'
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
            },
            'pace': {
              keepExpandedHierarchy: true,
              stripGlobBase: true,
              files: [
                'themes/orange/*.css',
                '*.js'
              ]
            }
          }
        }
      }
    },

    favicons: {
      options: {
        trueColor: true,
        precomposed: true,
        appleTouchPadding: 0,
        appleTouchBackgroundColor: 'auto',
        coast: true,
        windowsTile: true,
        tileBlackWhite: false,
        tileColor: 'auto',
      },
      ico: {
        src: 'client/public/panels/david-logo.png',
        dest: 'assets/panels/'
      }
    },

    /**
     * 制作精灵图，所有精灵元素均可以保存在 `client/public/sprites/` 目录下
     */
    sprite: {
      dist: {
        src: 'client/public/panels/sprites/*.png',
        dest: '<%= spriteImageFile %>',
        destCss: '<%= spriteLessFile %>',
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
      picture: {
        options: {
          optimizationLevel: 3
        },
        cwd: 'client/public/panels/',
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
          sourceMapFilename: '<%= styleDistPath %>/<%= name %>.min.css.map',
        },
        src: ['<%= buildPath %>/styles/bootstrap.less'],
        dest: '<%= styleDistPath %>/<%= name %>/<%= name %>.min.css',
      }
    },

    script: {
      srcModules: [],
      srcFiles: [],
    },

    // html|jade|exjs|haml to angular module.
    html2js: {
      ui: {
        options: {
          useStrict: true,
          base: 'client/public/scripts/ui/templates',
          module: null,
          rename: function(name) {
            return 'templates/' + name.replace(path.extname(name), '.html');
          }
        },
        dest: '<%= buildPath %>/scripts/ui/templates',
        cwd: 'client/public/scripts/ui/templates',
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
        src: ['<%= script.srcFiles %>'],
        dest: '<%= scriptDistPath %>/<%= name %>/<%= name %>.js',
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
        dest: '<%= scriptDistPath %>/<%= name %>/<%= name %>.min.js',
      },
      app: {
        dest: 'assets/scripts/app/',
        cwd: 'assets/scripts/app/',
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
      views: {
        dest: 'assets/views/',
        cwd: 'client/app/',
        src: ['*/*.jade'],
        ext: '.html',
        expand: true,
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
      // config
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
      'style': {
        files: ['client/public/styles/*/*.less', 'client/app/*/styles/*/*.less'],
        tasks: ['compileStyle']
      },
      'script': {
        files: [
          'client/public/scripts/**/*.js'
          , 'client/public/scripts/ui/templates/**/*.jade'
          , 'client/app/*/scripts/**/*.js'
        ],
        tasks: ['concatJS']
      },
      'layout': {
        files: [
          'client/app/*/templates/**/*.jade'
          , 'client/app/*/templates/*.jade'
          , 'client/app/*/index.jade'
        ],
        tasks: ['compileJade']
      }
    },
  })


  // Merged Tasks
  // ================

  /**
   * 该任务将会合并并编译 `client/public/styles` 下所有的样式。你可以在
   * `client/public/styles/bootstrap.json` 里面配置一下文件导入顺序，
   * 因为公共样式并没有很强的单一依赖关系，则多个文件可能互相不依赖，但他们都
   * 必须引入到公用样式用，因此我们必须安排他们的顺序。
   *
   * `bootstrap.json` (因为有 `/*` 所以加上反斜杠)
   * [
   *   "/variables/**\/*.less"
   *   , "/mixins/**\/*.less"
   *   , "/resets/**\/*.less"
   *   , "/core/**\/*.less"
   *   , "/effects/**\/*.less"
   *   , "/utilities/**\/*.less"
   *   , "/components/**\/*.less"
   * ]
   *
   * 除此以外，任务还会根据 `client/app/` 下的目录再合并各个应用。我们可以将
   * 这些应用看成一个 SPA，而这些应用下的各种情景我们可以将它定义为一个模块。
   * 
   * 例如：
   * client/
   *   app/
   *     index/
   *       styles/
   *         index.less
   *         user.less
   *
   * 这样我们就是生成一个名叫 `index` 的应用，而不同模块的样式我们统一放在
   * `styles/` 里面，因为里面的样式一般都各自不没有任何关联，因此我们将他们
   * 的所有样式文件合并成一个与应用名一样的 CSS 文件，并存放在 `assets/styles/app`
   * 目录下；同时这些文件可以 `@import` 文件夹 `client/public/style` 下的所有文件。
   * 若有特殊的 mixins 我们可以再在 `style` 目录下再建立 `mixins`
   * 等文件夹，再通过 `@import` 引入。
   *
   * 注意：
   *
   * 系统会将应用样式写入到 `watch` 任务中，同时也会将扩展一个 `less` 任务，
   * 当应用样式修改的时候，只会执行该生成的 `less` 任务。
   * 
   * 当公共样式有 `新增/修改/删除` 的时候，系统将会重新执行该任务；应用样式有 `新增/删除` 的时候，
   * 系统也会重新执行该任务；而应用样式 修改 后只会执行重新编译该应用的样式。
   */
  grunt.registerTask('less2Css', 'Find the style file and compile them to css.', function() {
    var bootstrapFile = grunt.config('buildPath') + '/styles/bootstrap.less'
        , distPath = grunt.config('styleDistPath')
        , absPaths = (grunt.file.readJSON('client/public/styles/bootstrap.json') || [])
          .map(function(path) {
            return grunt.config('stylePublicPath') + path
          })
        , modules = []

    // Public style
    // ============

    grunt.log.subhead('Compile public less files.')
    modules = findLesses(grunt.file.expand(absPaths))

    grunt.file.write(bootstrapFile, _.pluck(modules, 'srcFile')
      .map(function(file) {
        grunt.log.writeln('File ' + file.cyan + ' imported.')
        return '@import ' + enquote(file) + ';'
      })
      .join('\n'))

    grunt.log.writeln('Above state will be saved in temp file ' + enquote(bootstrapFile).cyan)


    // Apps style
    // ==========

    grunt.file
    .expand('client/app/*')
    .forEach(function(dir) {
      var stats = fs.lstatSync(dir)
          , name = dir.split('/').splice(-1, 1)[0]
          , bootstrapFile = grunt.config('buildPath') + '/styles/app/' + name + '.less'
          , modules = []

      if (!stats.isDirectory()) {
        return
      }

      grunt.log.subhead('Compile module `' + name + '` less files.')
      modules = findLesses(grunt.file.expand(dir + '/styles/*.less'))

      grunt.file.write(bootstrapFile, _.pluck(modules, 'srcFile')
        .map(function(file) {
          grunt.log.writeln('File ' + file.cyan + ' imported.')
          return '@import ' + enquote(file) + ';'
        })
        .join('\n'))

      grunt.log.writeln('Above state will be saved in temp file ' + enquote(bootstrapFile).cyan)

      // Extend jade task.
      grunt.config('less.$' + name, {
        options: _.extend(grunt.config('less.options'), {
          banner: '/* ' + name + '.css#<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n',
          sourceMapFilename: distPath + '/app/' + name + '.min.css.map',
        }),
        src: ['<%= buildPath %>/styles/app/' + name + '.less'],
        dest: distPath + '/app/' + name + '.min.css',
      })
    })
    
    grunt.task.run(['less', 'saveState'])
  })
  
  /**
   * concatJS 任务首先会根据各应用中的模块 `client/app/*` 获取所有需要用到的公共模块，
   * 这些公共模块再会通过依赖关系获取相应的模块，这样就可以列出相应的顺序引入到公共模块。
   * 然后再合并 `client/app\/*\/scripts/` 下的所有模块生成名为应用名的脚本文件。
   */
  grunt.registerTask('concatJS', 'According to dependencies, merge and sort the angularjs files.', function() {
    var appFiles = []
        , appModules = []
        , cmmModules = []
        , cmmDeps = []
        , uiTplModules = []

    appFiles = grunt.file
    .expand('client/app/*/scripts/*.js')
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

    // Find out all common moudles' dependencies.
    _.pluck(cmmModules, 'dependencies')
    .forEach(function(deps) {
      if (deps.length > 0) {
        cmmDeps = cmmDeps.concat(deps)
      }
    })

    cmmDeps = underscore.unique(cmmDeps)

    /**
     * Find out all the angular ui tempalte file.
     * Compile them to angular modules and save to the tmp path.
     */
    uiTplModules = grunt.file
    .expand(grunt.config('scriptPublicPath') + '/ui/templates/*/*.jade')
    .map(function(filePath) {
      var file = path.basename(filePath).replace(path.extname(filePath), '.html')
          , relativePath = path.dirname(filePath).split('/').pop() + '/' + file
          , name = 'templates/' + relativePath
          , moduleName = enquote(name)
          , srcFile = grunt.config('buildPath') + '/scripts/ui/templates/' + relativePath + '.js'

      return { name: name, moduleName: moduleName, srcFile: srcFile }
    })
    .filter(function(module) {
      return -1 !== cmmDeps.indexOf(module.name)
    })

    // Pakage configure & Run concat task
    var pubModules = cmmModules.concat(uiTplModules)
        , srcModules = _.pluck(pubModules, 'moduleName')
        , srcFiles = _.pluck(pubModules, 'srcFile')

    srcFiles
    .forEach(function(file) {
      grunt.log.writeln('File ' + file.cyan + ' imported.')
    })

    grunt.config('script.srcModules', srcModules)
    grunt.config('script.srcFiles', srcFiles)

    // Add app file concat task and add a watching task.
    var apps = {}

    appModules
    .forEach(function(module) {
      var name = path
          .dirname(module.srcFile)
          .split('\/')
          .slice(2,3)[0]

      if (!apps[name]) {
        apps[name] = []
      }

      apps[name].push(module)
    })

    var name = ''
    for (name in apps) {
      grunt.log.subhead('Concat scripts file of `' + name + '` SPA.')

      // Extend concat task.
      grunt.config('concat.$' + name, {
        options: {
          banner: '// ' + name + '.js#<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n',
        },
        src: apps[name]
          .map(function(app) {
            grunt.log.writeln('File ' + app.srcFile.cyan + ' imported.')
            return app.srcFile
          }),
        dest: '<%= scriptDistPath %>/app/' + name + '.js',
      })
    }

    // Run the concat task.
    grunt.task.run(['html2js:ui', 'concat'])
  })

  grunt.registerTask('compileJade', 'Find the jade file and watch them in each app.', function() {
    grunt.file
    .expand('client/app/*/')
    .forEach(function(dir) {
      var stats = fs.lstatSync(dir)
          , name = dir.split('/').splice(-2, 1)[0]

      if (!stats.isDirectory()) {
        return
      }

      // Extend jade task.
      grunt.config('jade.$' + name, {
        dest: 'assets/templates/' + name + '/',
        cwd: 'client/app/' + name + '/templates/',
        src: '*.jade',
        ext: '.html',
        expand: true,
      })
    })

    grunt.task.run(['jade'])
  })

  grunt.registerTask('loadState', 'Load grunt\'s config from json file and merge them.', loadState)
  grunt.registerTask('saveState', 'Save grunt config state to json file.', saveState)

  grunt.registerTask('buildAssets', ['bower', 'copy:assets', 'favicons', 'sprite', 'imagemin'])
  grunt.registerTask('compileStyle',  ['less2Css'])
  grunt.registerTask('concatScript', ['concatJS'])
  grunt.registerTask('compileLayout', ['compileJade'])
  grunt.registerTask('default', ['development'])

  grunt.registerTask('test-config', 'Task for test the grunt file.', function() {
    grunt.task.run(['jshint:gruntfile'])
  })

  /**
   * If you in development. You can only run development task.
   * It will only concat the file, run the unit-test. But it will
   * not to compress the files.
   */
  grunt.registerTask('development', 'Task for develop environment.', function() {
    timer.init(grunt)

    grunt.config('environment', 'DEVELOPMENT')

    grunt.config('less.options', _.extend(grunt.config('less.options'), {
      compress: false,
      yuicompress: false,
      sourceMap: false,
      outputSourceFiles: false,
    }))

    grunt.task.run(['clean', 'buildAssets', 'compileStyle', 'concatScript', 'compileLayout', 'watch'])
  })

  /**
   * Task for release a new version.
   */
  grunt.registerTask('release', 'Task for jshint test and unit test before release a new version.', function() {
    grunt.task.run(['clean', 'test-config', 'clean', 'buildAssets', 'compileStyle', 'concatScript', 'uglify', 'karma:release', 'hashmap', 'compileLayout'])
  })

  /**
   * Production task, it is fully task to run the project.
   * Watch the file, run the unit-test task, concat and compress files, etc.
   */
  grunt.registerTask('production', 'Task for product environment.', function() {
    grunt.config('environment', 'PRODUCTION')
    grunt.task.run(['test-config', 'clean', 'buildAssets', 'compileStyle', 'concatScript', 'uglify', 'hashmap', 'compileLayout', 'watch'])
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
      
      if (existsModules[filePath]) {
        return
      }

      existsModules[filePath] = true

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

      if (existsModules[filePath]) {
        return
      }

      existsModules[filePath] = true

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
