
"use strict";

const gulp = require("gulp");
const $ = require('gulp-load-plugins')();

const pump = require('pump');

const config = require('../config');

const reveal = require('./reveal');

function fontAwesome(cb) {
  pump([
    gulp.src(config.sys.lib['font-awesome']('fonts/**/*')),
    $.rename({ dirname: '' }),
    gulp.dest(config.sys.assets.fonts('font-awesome/'))
  ], cb);
}

const task = gulp.parallel(fontAwesome, reveal);
gulp.task('vendor', task);

module.exports = {
  task: task,

  watch: function () {
    gulp.watch('package.json', task);
  }
};
