"use strict";

const $ = require('gulp-load-plugins')();

const config = require('./config');
const util = require('./util');

$.filterMin = function filterMin() {
  return $.filter([`**/*`, `!**/*.min.*`], { restore: true });
};

$.renameMin = function renameMin() {
  return $.rename(path => {
    if (path.basename.indexOf('.min') < 0) {
      path.extname = '.min' + path.extname;
    }
  });
};

function loadIfProd(loadFn) {
  let real;

  return () => {
    if (!real) {
      if (util.isProd()) {
        real = loadFn;
      } else {
        real = $.identity;
      }
    }

    return real();
  };
}

$.uglify_css = loadIfProd(() => ($.uglifycss(config.uglifyOptions)));

module.exports = $;
