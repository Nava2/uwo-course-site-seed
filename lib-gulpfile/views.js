
"use strict";

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const container = require('markdown-it-container');
const markdown = require('markdown-it');
const merge2 = require('merge2');
const moment = require('moment');
const padLeft = require('pad-left');
const pump = require('pump');

const util = require('./util');
const config = require('./config');


const loadMeta = _.memoize(inPath => {
  const jsonPath = path.join(inPath, 'meta.json');

  let meta;
  if (util.isDev()) {
    meta = JSON.parse(fs.readFileSync(jsonPath));
  } else {
    meta = require('../' + jsonPath.replace(/\\/g, '/'));
  }

  meta.link = function makeLink(subPath) {
    return util.htmlPathJoin('/', meta.base, subPath);
  };
  meta.items = meta.items.map((l, idx) => {
    let out = _.cloneDeep(l);
    out.index = idx;
    out.date = moment(l.date);
    out.href = meta.link(l.href);

    return _.defaultsDeep(out,  meta.default);
  });

  meta.groupKeys.forEach(key => {
    meta["by" + _.capitalize(key)] = _.groupBy(meta.items, key);
  });

  meta.byFileKey = _.fromPairs(meta.items.map(it => {
    return [it.href.substring(it.href.lastIndexOf('/') + 1), it];
  }));

  return meta;
});

const PUG_CLASS_ID_RE = /(\.[\w_-]+|#[\w_-]+)\s*/g;
function pugClassesToHtml(params) {
  let allParams = [];

  // get all the parameters from the string
  let m;
  while ((m = PUG_CLASS_ID_RE.exec(params)) !== null) {
    allParams.push(m[1]);
  }

  const classes = _(allParams).filter(v => (v.startsWith('.')))
    .map(v => (v.slice(1))).value();

  const id = _.find(allParams, v => (v.startsWith('#')));

  let out = '';

  if (id) {
    out += ` id='${id.slice(1)}'`;
  }

  if (classes.length > 0) {
    out += ` class='${classes.join(' ')}'`;
  }

  return out;
}

function loadMd(mdOptions) {
  const md = markdown(mdOptions);

  function newContainer(md, name, render) {
    const CONT_REGEX = new RegExp(`^${name}\\s+(.*)$`);

    function getRest(info) {
      const m = _.compact(CONT_REGEX.exec(info.trim()));
      if (!m || m.length === 0) {
        return '';
      } else {
        return m[1];
      }
    }

    md.use(container, name, {
      validate: params => (params.trim().match(CONT_REGEX)),
      render: render(getRest)
    });
  }

  newContainer(md, 'section', getRest => {
    return (tokens, idx) => {
      if (tokens[idx].nesting === 1) {


        let out = '<section';
        out += pugClassesToHtml(getRest(tokens[idx].info));
        return out + '>';
      } else {
        return '</section>';
      }
    };
  });

  newContainer(md, 'notes', () => {
    return (tokens, idx) => {
      if (tokens[idx].nesting === 1) {
        return '<aside class=".notes">';
      } else {
        return '</aside>';
      }
    };
  });

  return md;
}

const REGEX_PARAMS = (() => {
  const TYPES =  {
    NUMBER: /(?:\d+|\d*(?:\.\d+))/,
    STRING: /(?:["']([^"']*)["']|([\w-]+))/,
    BOOLEAN: /(?:true|false)/
  };

  const PARAMS = _.fromPairs(_.map(TYPES, (reg, type) => {
    return [type, (name) => {
      let reg = `(${name})(?:\\s*=\\s*(${TYPES[type].source}))`;

      if (type === 'boolean') {
        reg += '?';
      }
      return { type: type.toLowerCase(), regex: new RegExp(reg) };
    }];
  }));

  const ANY = new RegExp('(?:\\s*(?:[\\w-]+)?(?:\\s*=\\s*' +
      `(?:${TYPES.STRING.source}|${TYPES.BOOLEAN.source}|${TYPES.NUMBER.source})` +
    ',?\\s*)?)*');

  return {
    TYPES: TYPES,
    PARAMS: PARAMS,
    ANY: ANY
  };
})();

function createMixin(name, parameters, transformFn) {

  const param = _.map(parameters, (type, param) => {
    let obj = REGEX_PARAMS.PARAMS[type.toUpperCase()](param);
    return {
      param: param,
      type: obj.type,
      regex: obj.regex
    };
  });

  const MIXIN_REGEX = new RegExp(`\\+${name}(?:\\((${REGEX_PARAMS.ANY.source})\\))?`, 'g');

  function transform(text) {
    let replace = [];
    let m;
    while(!!(m = MIXIN_REGEX.exec(text))) {
      const mixin = m[1];

      const extractedParams = _(param).map(obj => {
        const m = obj.regex.exec(text);

        // Handle extracting the parameter
        // if its a boolean, we handle it specially, treating it like a flag, defaulting to false.
        if (!m) {
          if (obj.type === 'boolean') {
            return [obj.param, {
              start: -1,
              end: 0,
              type: obj.type,
              value: false
            }];
          } else {
            return null;
          }
        }

        let outValue;
        switch (obj.type) {
          case 'boolean':
            outValue = !!m[2] && m[2] === 'true';
            break;

          case 'string':
            outValue = m[3] || m[4];
            break;

          case 'number':
            outValue = Number.valueOf(m[2]);
            break;
        }

        return [obj.param, {
          start: m.index,
          end: m.index + m[0].length,
          type: obj.type,
          value: outValue
        }];
      }).compact()
        .fromPairs()
        .value();

      const presentParams = _.keys(extractedParams).sort();
      const missingParams = _(parameters).filter((v, k) => (_.sortedIndexOf(presentParams, k) === -1))
        .keys()
        .value();

      if (missingParams.length > 0) {
        const paramStr = missingParams.map((v, k) => (`${k}: ${v}`)).join(', ');
        throw new TypeError(`Missing parameters for +${name}(...): ${paramStr}`);
      }

      replace.push({
        start: m.index,
        end: m.index + m[0].length,
        transform: (text) => (transformFn(extractedParams, text))
      });
    }

    return replace;
  }

  transform.wrapped = transformFn;

  return transform;
}

const mixins = (() => {

  const icn = createMixin('icn', {
    icon: 'string',
    hidden: 'boolean',
  }, (params) =>
    (`<i class="fa fa-${params.icon.value}" aria-hidden="${params.hidden.value}"></i>`));

  const owlLink = createMixin('owlLink', {
      href: 'string',
      text: 'string'
    }, (params) => {
      return `<a href="https://owl.uwo.ca/portal/site/2b63b99c-73df-48ea-8184-594fe6cce918/${params.href.value}">` +
        icn.wrapped({ icon: { value: 'graduation-cap' }, hidden: { value: true } }) + '&nbsp;' +
        params.text.value +
        '</a>';
    });

  return {
    icn: icn,
    owlLink: owlLink
  };
})();

const DEFAULT_MIXINS = [
  mixins.icn,
  mixins.owlLink
];

function mdFilter(text, options) {
  let replacements = _(DEFAULT_MIXINS).concat(options.mixins)
    .flatten().compact()
    .map(f => (f(text)))
    .flatten()
    .sortBy('start')
    .reverse()
    .value();

  replacements.forEach(r => {
    const slice = text.slice(r.start, r.end);
    text = text.slice(0, r.start) + r.transform(slice) + text.slice(r.end);
  });

  options.langPrefix = 'lang-';
  options.html = (replacements.length > 0) || options.html;
  options.xhtmlOut = true;

  return loadMd(options).render(text);
}

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
  filters: {
    'md': mdFilter
  }
};

function loadOptions(data) {
  let opts = _.cloneDeep(PUG_OPTIONS);

  opts.locals.data = data;

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
      $.webpack(require('../webpack.config.js')),
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
      gulp.watch([config.sys.templates('**/*.pug'), config.sys.src('**/*.pug')], viewsPug);
      gulp.watch(config.sys.src('**/*.pdf'), viewsPdf);
    }
  };
};
