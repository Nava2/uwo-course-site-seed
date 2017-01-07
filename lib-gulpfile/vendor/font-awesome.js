/**
 * Created by kevin on 05/01/2017.
 */

"use strict";

const _ = require('lodash');
const pump = require('pump');

const config = require('../config');

module.exports = (gulp, $) => {
  return function fontAwesome(cb) {
    pump([
      gulp.src(config.sys.lib['font-awesome']('fonts/**/*')),
      $.rename({ dirname: '' }),
      gulp.dest(config.sys.assets.fonts('font-awesome/'))
    ], cb);
  };
};
