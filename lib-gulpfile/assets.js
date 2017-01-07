
"use strict";

const _ = require('lodash');
const merge2 = require('merge2');
const pump = require('pump');

const config = require('./config');
const util = require('./util');

module.exports = (gulp, $) => {

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

  const tasks = {
    assets: media
  };
  _.forEach(tasks, (v, k) => { gulp.task(k, v); });

  return {
    tasks: {
      assets: media
    },

    watch: function () {
      gulp.watch([config.sys.templates('**/*.@(ogg|mp4)'), config.sys.templates('**/img/**/*')], media);
    }
  };
};
