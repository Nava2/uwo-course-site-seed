"use strict";

const path = require('path');
const config = require('./config');
const util = require('./util');

const _ = require('lodash');
const gutil = require('gulp-util');
const padLeft = require('pad-left');
const pump = require('pump');

function getRangeArg(variable) {
  function parseRange(str) {
    const range = str.split('-').map(v => Number(v));
    if (range.length == 1) {
      range.push(range[0]);
    }
    range[1]++;

    return _.range.apply(this, range)
  }

  const envVar = gutil.env[variable];
  if (_.isArray(envVar)) {
    return _.flatten(envVar.map(parseRange));
  } else if (_.isNumber(envVar)) {
    return _.range(envVar, envVar + 1);
  } else if (_.isString(envVar)) {
    return parseRange(envVar);
  } else {
    return [];
  }
}

const TASK_NAME = 'pdfs';
module.exports = (gulp, $) => {

  function pdfLectures(cb) {

    let options = _.cloneDeep(config.decktape);

    if (gutil.env['remote']) {
      options.hrefBase = gutil.env['remote'];
    }

    const exclude = getRangeArg('x');
    const lectures = _.filter(getRangeArg('r'), v => (_.indexOf(exclude, v) == -1))
      .map(l => (config.sys.templates.lectures(`**/${padLeft(l, 2, '0')}-**`)));

    const pugs = lectures.map(p => (p + '.pug'));

    const TEMPLATE = _.template('<%= config.decktape.phantomjs %> <%= config.decktape.js %> ' +
      'reveal <%= config.decktape.hrefBase %>');

    pump([
      gulp.src(pugs),
      $.filter(['**', `!**/*.@(layout|component).pug`]),
      $.debug({ title: 'Saving Lecture:' }),
      $.rename({ extname: '' }),
      $.exec(TEMPLATE({ decktape: options }) + '<%= options.htmlPath(file.path) %>?printing <%=options.pdfPath(file.path) %>',
        {
          cwd: options.srcDir,
          htmlPath: input => (util.htmlPathJoin(path.relative(config.sys.templates(), input))),
          pdfPath: function (input) {
            return path.relative('./' + options.srcDir, config.sys.templates(this.htmlPath(input) + '.pdf'));
          }
        }),
      $.exec.reporter({ stdout: true }),
      $.debug({ title: 'Finished Lecture:' }),
      gulp.src(lectures.map(p => (p + '.pdf'))),
      gulp.dest(config.sys.dist('lectures/pdf')),
      $.debug({ title: 'Copied Lecture:' }),
    ], cb);
  }


  const tasks = {
    lectures: pdfLectures,
    pdfs: gulp.series(pdfLectures)
  };
  _.forEach(tasks, (v, k) => gulp.task(k, v));


  return {
    tasks: tasks
  };
};
