/**
 * Loads the configuration data from the package.json and adds some functions as convenience.
 */

"use strict";

const path = require('path');

const _ = require('lodash');
const env = require('dotenv').config();
const util = require('../lib/util');

const packageJson = require('../package.json');

const seed = _.defaultsDeep(packageJson.teachingSeedConfig, {
  outDir: './dist/',

  paths: {
    assets: {
      root: 'assets/',
      css: 'css/',
      fonts: 'font/',
      img: 'img/',
      js: 'js/',
      lib: 'lib/',
      video: 'video/'
    },

    src: {
      root: './src/'
    },

    templates: {
      root: './templates/'
    },
  },


  reveal: {
    plugins: [],
    theme: "solarized",
    path: {
      plugin: "plugin/",
      theme: "theme/"
    }
  }
});

const DEPS = _.fromPairs(_.map(packageJson.dependencies, (v, k) => ([k, k + '/'])));

function joinSysPath(...paths) {
  return path.join.apply(null, _.flattenDeep(paths));
}

function loadNonRoot(fn, from) {
  _.forEach(from, (v, k) => {
    if (k === 'root') { return; }

    fn[k] = function (...rest) {
      return fn(v, rest);
    };
  });

  return fn;
}

// System sys:
let sys = {
  dist: function (...rest) {
    return path.join(seed.outDir, path.join.apply(null, rest));
  },

  assets: function (...rest) {
    return joinSysPath(seed.outDir, seed.paths.assets.root, rest);
  },

  src: function (...rest) {
    return joinSysPath(seed.paths.src.root, '/', rest);
  },

  templates: function (...rest) {
    return joinSysPath(seed.paths.templates.root, '/', rest);
  },

  lib: function (...rest) {
    return joinSysPath('node_modules/', rest);
  }
};
sys.templates  = loadNonRoot(sys.templates, seed.paths.templates);
sys.src        = loadNonRoot(sys.src, seed.paths.src);
sys.assets     = loadNonRoot(sys.assets, seed.paths.assets);
sys.lib        = loadNonRoot(sys.lib, DEPS);
sys.assets.lib = loadNonRoot(sys.assets.lib, DEPS);
sys.assets.lib['reveal.js'] = loadNonRoot(sys.assets.lib['reveal.js'], seed.reveal.path);
sys.reveal     = sys.assets.lib['reveal.js'];


// Web sys:
let web = {
  assets: function (...rest) {
    return util.htmlPathJoin(seed.paths.assets.root, rest);
  }
};
web.assets      = loadNonRoot(web.assets, seed.paths.assets);
web.assets.lib  = loadNonRoot(web.assets.lib, DEPS);
web.assets.lib['reveal.js'] = loadNonRoot(web.assets.lib['reveal.js'], seed.reveal.path);
web.reveal     = web.assets.lib['reveal.js'];

// Exports:

module.exports = {
  dependencies: DEPS,

  outDir: seed.outDir,

  reveal: {
    plugins: seed.reveal.plugins,
    theme: seed.reveal.theme,
  },

  uglifyOptions: seed.uglify,
  decktape: _.extend(seed.decktape, {
    hrefBase: env.parsed['PDF_HREF_BASE']
  }),

  sys: sys,
  web: web,

  course: seed.course,

  deploy: {
    url: env.parsed['DEPLOY_REPOSITORY']
  }

};

