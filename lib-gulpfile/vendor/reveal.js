
"use strict";

const gulp = require("gulp");

const path = require('path');

const _ = require('lodash');
const pump = require('pump');

const config = require('../config');
const $ = require('../plugins');

const libLoc = config.sys.npm['reveal.js'];
function revealHeadjs(cb) {
  pump([
    gulp.src(libLoc('lib/js/head.min.js')),
    $.rename({ dirname: '' }),
    gulp.dest(config.sys.reveal()),
  ], cb);
}

/**
 * Copies the files specified in REVEAL_PLUGINS into the /reveal-plugin/ root directory in DIST_DIR
 */
function revealPlugins(cb) {
  const neededPluginsFilter = $.filter(config.reveal.plugins.map(p => path.join('**', p, '*')));

  pump([
    gulp.src(libLoc('plugin/**/*.@(js|html)')),
    neededPluginsFilter,
    $.rename(p => {
      if (p.extname !== '' || p.basename === 'LICENSE') { // its not a directory
        p.dirname = _.last(p.dirname.split(path.sep));
      } else {
        p.dirname = '';
      }
    }),
    gulp.dest(config.sys.reveal.plugin())
  ], cb);
}

function fixFontCss() {
  return $.replace(/url\(\.\.\/\.\.\/lib\/font/, `url(${config.web.assets.fonts()}`);
}

/**
 * Copies the files specified in REVEAL_PLUGINS into the /reveal-plugin/ root directory in DIST_DIR
 */
function revealCss(cb) {
  const filterMin = $.filterMin();
  pump([
    gulp.src(['theme/*.css', 'reveal.scss'], { cwd: libLoc('css') }),
    $.sourcemaps.init(),

    filterMin,
    fixFontCss(),
    $.sass(),
    $.uglify_css(),
    $.renameMin(),
    filterMin.restore,

    $.rename({ dirname: '' }),

    $.sourcemaps.write(),
    gulp.dest(config.sys.reveal())
  ], cb);
}

/**
 * Copies the files specified in REVEAL_PLUGINS into the /reveal-plugin/ root directory in DIST_DIR
 */
function revealThemeFonts(cb) {

  const cssFilter = $.filter('**/*.css', { restore: true });

  pump([
    gulp.src(libLoc('lib/font/**/*')),
    $.sourcemaps.init(),

    cssFilter,
    fixFontCss(),
    cssFilter.restore,

    $.rename(p => {
      if (p.extname !== '' || p.basename === 'LICENSE') { // its not a directory
        p.dirname = _.last(p.dirname.split(path.sep));
      } else {
        p.dirname = '';
      }
    }),

    $.sourcemaps.write(),
    gulp.dest(config.sys.assets.fonts())
  ], cb);
}

module.exports = gulp.parallel(
    revealHeadjs,
    revealThemeFonts,
    revealCss,
    revealPlugins);


