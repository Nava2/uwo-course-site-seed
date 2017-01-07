
"use strict";

const _ = require('lodash');
const gulp = require('gulp');
const merge2 = require('merge2');

/**
 * Returns true if building for production
 * @returns {boolean}
 */
function isProd() {
  return process.env['NODE_ENV'] === 'production';
}

/**
 * Returns true if building for development
 * @returns {boolean}
 */
function isDev() {
  return !isProd();
}

/**
 * Joins the components of a path together, merging them and replacing duplicate '/' characters.
 *
 * @param {string|*[]} components Array of string values (may be nested, will be flattened)
 * @returns {string} Combined path.
 */
function htmlPathJoin(...components) {
  const result = '/' + _.flattenDeep(components).join('/');

  return result.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
}

/**
 *
 * @param {string[]} globs File globs
 * @param {string[]} cwds Array of directories
 * @returns {StreamFile} stream of sources
 */
function srcDirs(globs, ...cwds) {
  return merge2(cwds.map(cwd => (gulp.src(globs, { cwd: cwd }))));
}

module.exports = {
  isProd: isProd,
  isDev: isDev,
  htmlPathJoin: htmlPathJoin,
  srcDirs: srcDirs,
};
