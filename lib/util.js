
"use strict";

const _ = require('lodash');

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

module.exports = {
  htmlPathJoin: htmlPathJoin
};
