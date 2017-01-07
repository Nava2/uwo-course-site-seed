
"use strict";

const _ = require('lodash');


const TASK = 'vendor';

module.exports = (gulp, $) => {


  const fa = require('./font-awesome')(gulp, $);
  const reveal = require('./reveal')(gulp, $);

  const task = gulp.parallel(fa, reveal);
  gulp.task(TASK, task);

  return {
    task: task,

    watch: function () {
      gulp.watch('package.json', task);
    }
  };
};
