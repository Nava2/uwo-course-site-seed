
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

const LINE_REGEX = /^\n*(\s*)[^\s]/;
const SPACE_REGEX = /^(\s*)[^\s]/;

function smartCodeTrim(codeStr) {
  let result = LINE_REGEX.exec(codeStr);
  if (result.length > 1) {
    // trim data:
    let lines = codeStr.split('\n');

    let i = 0;
    while (lines[i].trim().length === 0 && i <= lines.length) {
      i++;
    }

    lines.splice(0, i);

    i = lines.length - 1;
    while (lines[i].trim().length === 0 && i >= 0) {
      i--;
    }
    i++;
    lines.splice(i, lines.length - i);

    let trimLength = Number.MAX_SAFE_INTEGER;
    lines.forEach(function (line) {
      let r = SPACE_REGEX.exec(line);
      if (!!r && r.length > 1) {
        trimLength = Math.min(trimLength, r[1].length);
      }
    });

    return lines.map(function (l) {
      return l.substr(trimLength);
    }).join('\n');
  }

  return codeStr;
}

module.exports = {
  htmlPathJoin: htmlPathJoin,

  smartCodeTrim: smartCodeTrim
};
