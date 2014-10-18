

module.exports = function(grunt) {'use strict';
  var path = require('path'),
      exports = {};

  function enquote(str) {
    return '"' + str + '"';
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

  exports.findStyle = function(file) {
    return {
      name: path.basename(file),
      import: '@import ' + enquote(file) + ';',
      file: file + '.less'
    };
  };

  exports.findScript = function(args) {
    var modules = [],
        existsModules = {};

    function findScriptModules(name) {
      if (existsModules[name]) return;
      existsModules[name] = true;

      var module = {
        name: name,
        moduleName: enquote('ui.' + name),
        displayName: ucwords(breakup(name, ' ')),
        srcFile: 'src/scripts/modules/' + name + '.js',
        tpljsFile: grunt.file.expand(grunt.config('tempPath') + 'scripts/tpls/' + name + '/*.html.js'),
        tplModule: grunt.file.expand('src/scripts/tpls/' + name + '/*.jade')
        .map(function(filePath) {
          var ext = path.extname(filePath),
              file = path.basename(filePath).replace(ext, '.html');
          return enquote('tpls/' + name + '/' + file);
        }),
        dependencies: dependenciesForModule(name)
      };

      if (grunt.file.exists(module.srcFile)) {
        module.dependencies.forEach(findScriptModules);
        modules = modules.concat(module);
      }
    }

    function dependenciesForModule(name) {
      var deps = [];
      grunt.file.expand('src/' + name + '/*.js')
      .map(grunt.file.read)
      .forEach(function(contents) {
        var moduleDeclIndex = contents.indexOf('angular.module('),
            depArrayStart = contents.indexOf('[', moduleDeclIndex),
            depArrayEnd = contents.indexOf(']', depArrayStart),
            dependencies = contents.substring(depArrayStart + 1, depArrayEnd);

        dependencies.split(',')
        .forEach(function(dep) {
          if (dep.indexOf('ui.') > -1) {
            var depName = dep.trim().replace('ui.', '').replace(/['"]/g,'');
            if (deps.indexOf(depName) < 0) {
              deps.push(depName);
              deps = deps.concat(dependenciesForModule(depName));
            }
          }
        });
      });

      return deps;
    }

    args.forEach(findScriptModules);
    return modules;
  };

  return exports;
};