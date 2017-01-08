
"use strict";

const path = require('path');

const _ = require('lodash');
const merge2 = require('merge2');
const moment = require('moment');
const padLeft = require('pad-left');
const pump = require('pump');

const util = require('../util');
const config = require('../config');

const loadMeta = require('./meta');

const PUG_OPTIONS = {
  pretty: util.isDev(),
  locals: {
    moment: moment,
    _: _,
    padLeft: padLeft,
    join: util.htmlPathJoin,
    mark: function mark(idx, content) {
      return `<span class="fragment mark" data-fragment-index="${idx}"> ${content}</span>`;
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

module.exports = (gulp, $) => {

  function viewsPug(cb) {

    const lectures = loadMeta(config.sys.src('lectures/'));
    const labs = loadMeta(config.sys.src('labs/'));

    const remainingPugFilter = $.filter('**/*.pug', { restore: true });
    const lectureFilter = $.filter('**/lectures/**/*.pug', { restore: true });
    const labsFilter = $.filter('**/labs/**/*.pug', { restore: true });

    const pugOptions = loadOptions({
      lecture: lectures,
      lab: labs,
      owlHref: 'https://owl.uwo.ca/portal/site/2b63b99c-73df-48ea-8184-594fe6cce918',
      course: config.course
    });

    pump([
      util.srcDirs([
          '**/*.pug',
          '!**/*.@(layout|component|mixins).pug',
          '!**/_*.pug'
        ], config.sys.src(), config.sys.templates()),

      $.sourcemaps.init(),
      lectureFilter,
      $.data(f => {
        return { lecture: lectures.byFileKey[path.basename(f.path, '.pug')] };
      }),
      $.pug(pugOptions),
      lectureFilter.restore,

      labsFilter,
      $.data(f => {
        return  { lab: labs.byFileKey[path.basename(f.path, '.pug')] };
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

  const tasks = {
    'views:pug': viewsPug,
    'views:webpack': viewsWebpack,
    'views:pdf': viewsPdf,
    views: gulp.parallel(viewsPug, viewsPdf, viewsWebpack)
  };
  _.forEach(tasks, (v, k) => gulp.task(k, v));

  return {
    tasks: tasks,

    watch: function () {
      gulp.watch([config.sys.templates('**/*.ts'), 'webpack.config.js', 'tsconfig.json'], viewsWebpack);
      gulp.watch([
        config.sys.templates('**/*.pug'),
        config.sys.src('**/*.pug'),
        config.sys.src('**/meta.json')
      ], viewsPug);
      gulp.watch(config.sys.src('**/*.pdf'), viewsPdf);
    }
  };
};
