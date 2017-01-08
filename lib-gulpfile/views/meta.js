
const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const moment = require('moment');

const util = require('../util');
const config = require('../config');

function loadMeta(inPath) {
  const jsonPath = path.join(inPath, 'meta.json');

  let meta;
  if (util.isDev()) {
    meta = JSON.parse(fs.readFileSync(jsonPath));
  } else {
    meta = require('../../' + jsonPath.replace(/\\/g, '/'));
  }

  meta.link = function makeLink(subPath) {
    return util.htmlPathJoin('/', meta.base, subPath);
  };
  meta.items = meta.items.map((l, idx) => {
    let out = _.cloneDeep(l);
    out.index = idx;
    out.date = moment(l.date);
    out.href = meta.link(l.href);

    return _.defaults(out,  meta.default);
  });

  meta.groupKeys.forEach(key => {
    meta["by" + _.capitalize(key)] = _.groupBy(meta.items, key);
  });

  meta.byFileKey = _.fromPairs(meta.items.map(it => {
    return [it.href.substring(it.href.lastIndexOf('/') + 1), it];
  }));

  return meta;
}

module.exports = loadMeta;
