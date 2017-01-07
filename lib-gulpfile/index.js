
"use strict";

const path = require('path');
const url = require('url');

const ghpages = require('gh-pages');
const moment = require('moment');
const pump = require('pump');

const config = require('./config');
const util = require('./util');

module.exports = (gulp) => {

  const $ = require('./plugins');

  // load children tasks
  const assets = require('./assets')(gulp, $);
  const pdf = require('./pdf')(gulp, $);
  const src = require('./templates')(gulp, $);
  const vendor = require('./vendor')(gulp, $);
  const views = require('./views')(gulp, $);

  function clean(cb) {
    pump([
      gulp.src(config.sys.dist()),
      $.clean({ read: false, force: true })
    ], cb);
  }

  function nuke(cb) {
    pump([
      gulp.src(config.sys.lib()),
      $.clean({ read: false, force: true })
    ], cb);
  }
  // Generic clean tasks
  gulp.task('clean', clean);

  gulp.task('nuke', gulp.parallel(clean, nuke));

  const build = gulp.parallel(src.tasks.css, assets.tasks.assets, views.tasks.views, vendor.task);
  gulp.task('build', build);
  gulp.task('default', build);

  gulp.task('watch', () => {
    assets.watch(gulp);
    src.watch(gulp);
    vendor.watch(gulp);
    views.watch(gulp);
  });

  gulp.task('serve', cb => {
    pump([
      gulp.src(config.sys.dist()),
      $.webserver({
        host: '0.0.0.0',
        port: process.env.PORT || 8000,
        //path: DIST_PATH,
        livereload: util.isDev(),
        middleware: function (req, res, next) {
          const reqUrl = url.parse(req.url);

          // Stuff to be ignored
          if (reqUrl.pathname.startsWith('/assets')) {
            next();
            return
          }

          // If `/` is requested. append index to it
          if (reqUrl.pathname.endsWith('/')) {
            reqUrl.pathname += '/index';
          }

          const ext = path.extname(reqUrl.pathname);

          if (ext === '') {
            reqUrl.pathname += '.html';
          }

          req.url = url.format(reqUrl);
          next();
        }
        //open: true
      })
    ], cb);
  });

  gulp.task('deploy', cb => {
    ghpages.publish(config.sys.dist(), {
      branch: 'master',
      message: `Site update: ${moment().format(moment.ISO_8601())}`
    }, cb);
  });

  return gulp;
};
