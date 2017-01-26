
"use strict";

const gulp = require("gulp");

const path = require('path');
const url = require('url');

const _ = require('lodash');
const merge2 = require('merge2');
const moment = require('moment');
const padLeft = require('pad-left');
const pump = require('pump');

const $ = require('../plugins');
const config = require('../config');

const util = {
  gulp: require('../util'),
  htmlPathJoin: require('../../lib/util').htmlPathJoin
};

const meta = require('../../lib/course-config');

const PUG_OPTIONS = {
  locals: {
    moment: moment,
    _: _,
    padLeft: padLeft,
    url: url,
    join: util.htmlPathJoin,
    mark: function mark(idx, content) {
      return `<span class="fragment mark" data-fragment-index="${idx}">${content}</span>`;
    },
    assets: config.web.assets,
    reveal: config.web.reveal
  },
  filters: {}
};

function loadOptions(data) {
  let opts = _.cloneDeep(PUG_OPTIONS);

  opts.locals.data = data;

  opts.filters['md'] = require('./filter-md')({ locals: opts.locals });

  return opts;
}

function viewsPug(cb) {

  const courseConfig = meta(require('../../src/course.config'));

  const remainingPugFilter = $.filter('**/*.pug', { restore: true });
  const lectureFilter = $.filter('**/lectures/**/*.pug', { restore: true });
  const labsFilter = $.filter('**/labs/**/*.pug', { restore: true });

  const pugOptions = loadOptions({
    owlHref: 'https://owl.uwo.ca/portal/site/2b63b99c-73df-48ea-8184-594fe6cce918',
    course: courseConfig
  });

  pump([
    util.gulp.srcDirs([
      '**/*.pug',
      '!**/*.@(layout|component|mixins).pug',
      '!**/_*.pug'
    ], config.sys.src(), config.sys.templates()),

    $.sourcemaps.init(),
    lectureFilter,
    $.data(f => {
      return { lecture: courseConfig.components.lectures.by['file'][path.basename(f.path, '.pug')] };
    }),
    $.pug(pugOptions),
    lectureFilter.restore,

    labsFilter,
    $.data(f => {
      return { lab: courseConfig.components.labs.by['file'][path.basename(f.path, '.pug')] };
    }),
    $.pug(pugOptions),
    labsFilter.restore,

    remainingPugFilter,
    $.pug(pugOptions),
    remainingPugFilter.restore,

    $.sourcemaps.write(),

    gulp.dest(config.sys.dist())
  ], cb);
}

function viewsPdf(cb) {
  pump([
    gulp.src('**/*.pdf', { cwd: config.sys.src() }),
    $.rename(p => {
      p.dirname = p.dirname.replace(/[\\\/]pdf/, '');
    }),
    gulp.dest(config.sys.dist())
  ], cb);
}

function viewsBootstrapCalendar(cb) {
  const cssFilter = $.filter(['**/*.css'], { restore: true });

  pump([
    gulp.src('bootstrap-calendar/**/*.@(html|css|png)', { cwd: config.sys.npm() }),
    $.sourcemaps.init(),

    cssFilter,
    $.uglify_css(),
    $.renameMin(),
    cssFilter.restore,

    $.sourcemaps.write(),
    gulp.dest(config.sys.assets.lib('bootstrap-calendar/'))
  ], cb);
}

function viewsWebpack(cb) {
  pump([
    merge2(
      gulp.src(['main.ts', 'lectures/lectures.ts', 'labs/labs.ts'], { cwd: config.sys.templates() }),
      gulp.src(['index.ts'], { cwd: config.sys.src() })
    ),
    $.webpack(require('../../webpack.config.js')),
    gulp.dest(config.sys.assets.js())
  ], cb);
}

module.exports = {
  tasks: {
    'views:pug': viewsPug,
    'views:webpack': viewsWebpack,
    'views:pdf': viewsPdf,
    views: gulp.parallel(viewsPug, viewsPdf, viewsWebpack, viewsBootstrapCalendar)
  },

  watch: function watch() {
    gulp.watch([
      config.sys.templates('**/*.ts'),
      config.sys.src('**/*.ts'),
      config.sys.src('**/course.config.js'),
      config.sys.lib('**/*.js'),
      'webpack.config.js',
      'tsconfig.json'
    ], viewsWebpack);
    gulp.watch([
      config.sys.templates('**/*.pug'),
      config.sys.src('**/*.pug'),
      config.sys.src('**/course.config.js')
    ], viewsPug);
    gulp.watch(config.sys.src('**/*.pdf'), viewsPdf);
  }
};

_.forEach(module.exports.tasks, (v, k) => gulp.task(k, v));

