
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
 *
 * @param {string[]} globs File globs
 * @param {string[]} cwds Array of directories
 * @returns {StreamFile} stream of sources
 */
function srcDirs(globs, ...cwds) {
  return merge2(cwds.map(cwd => (gulp.src(globs, {cwd: cwd}))));
}

module.exports = {
  isProd: isProd,
  isDev: isDev,

  srcDirs: srcDirs
};
