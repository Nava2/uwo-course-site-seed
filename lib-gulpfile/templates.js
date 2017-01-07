
"use strict";

const _ = require('lodash');
const pump = require('pump');

const config = require('./config');

module.exports = (gulp, $) => {

  const vendor = require('./vendor')(gulp);

  function css(cb) {
    const sassFilter = $.filter('**/*.scss', { restore: true });

    pump([
      gulp.src('**/*.@(css|scss)', { cwd: config.sys.templates() }),
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

  const tasks = {
    css: gulp.series(css)
  };

  _.forEach(tasks, (v, k) => { gulp.task(k, v); });

  return {
    tasks: tasks,

    watch: function () {
      gulp.watch(['package.json', config.sys.templates('**/*.@(css|scss)')], css);
    }
  };
};
