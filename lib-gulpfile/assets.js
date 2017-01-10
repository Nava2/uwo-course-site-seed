
"use strict";

const gulp = require("gulp");
const $ = require('./plugins');

const _ = require('lodash');
const merge2 = require('merge2');
const pump = require('pump');

const config = require('./config');
const util = require('./util');

function media(cb) {
  const imgFilter = $.filter('**/img/**/*', { restore : true });
  const vidFilter = $.filter('**/video/**/*', { restore : true });

  pump([
    util.srcDirs(['**/img/*', '**/video/*.@(ogg|mp4)'],
      config.sys.src(),
      config.sys.templates()),

    imgFilter,
    $.rename(path => {
      path.dirname = 'img';
    }),
    imgFilter.restore,

    vidFilter,
    $.rename(path => {
      path.dirname = 'video';
    }),
    vidFilter.restore,

    gulp.dest(config.sys.assets())
  ], cb);
}

function favicon(cb) {
  pump([
    gulp.src(config.sys.templates('favicon.ico')),
    $.rename({ dirname: '' }),
    gulp.dest(config.sys.dist())
  ], cb);
}

const assets = gulp.parallel(media, favicon);

module.exports = {
  tasks : {
    assets: assets
  },

  watch: function () {
    function globs(input) {
      return _.flatten([
        config.sys.templates,
        config.sys.src
      ].map(fn => (input.map(g => fn(g)))));
    }

    gulp.watch(globs(['**/*.@(ogg|mp4)', '**/img/**/*']), media);
    gulp.watch(config.sys.templates('favicon.ico'), favicon);
  }
};

_.forEach(module.exports.tasks, (v, k) => { gulp.task(k, v); });
