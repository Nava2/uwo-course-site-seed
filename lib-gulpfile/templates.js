
"use strict";

const gulp = require("gulp");
const $ = require('./plugins.js');

const _ = require('lodash');
const merge2 = require('merge2');
const pump = require('pump');

const config = require('./config');

const vendor = require('./vendor');

function css(cb) {
  const sassFilter = $.filter('**/*.scss', { restore: true });

  pump([
    merge2(
      gulp.src('**/*.@(css|scss)', { cwd: config.sys.templates() }),
      gulp.src('**/*.@(css|scss)', { cwd: config.sys.src() })
    ),
    $.sourcemaps.init(),

    sassFilter,
    $.sass(),
    $.replace(/url\((['"])\.\.\/fonts\/fontawesome/g,
      `url($1${config.web.assets.fonts('font-awesome/fontawesome')}`),
    $.replace(/url\((?:\.\.\/)+lib\/font\/(league-gothic|source-sans-pro)/g,
      `url(${config.web.assets.fonts('/$1')}`),
    sassFilter.restore,

    $.uglify_css(),

    $.sourcemaps.write(),
    gulp.dest(config.sys.assets.css())
  ], cb);
}

module.exports = {
  tasks: {
    css: css
  },

  watch: function () {
    gulp.watch([
      'package.json',
      config.sys.templates('**/*.@(css|scss)'),
      config.sys.src('**/*.@(css|scss)')
    ], css);
  }
};

_.forEach(module.exports.tasks, (v, k) => { gulp.task(k, v); });
