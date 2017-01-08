"use strict";

/**
 * Defines a pug filter that is "markdown+" which has mixin support.
 */

const _ = require('lodash');
const container = require('markdown-it-container');
const markdown = require('markdown-it');

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

function loadDefaultHelpers(hb, locals) {
  function iconTag(icon, hidden) {
    const ariaHidden = !_.isUndefined(hidden) ? hidden : true;

    return new hb.SafeString(`<i class="fa fa-${icon}" aria-hidden="${ariaHidden}"></i>`);
  }

  hb.registerHelper('icon', function iconHelper(icon, options) {
    return iconTag(icon, options.hash['hidden']);
  });

  hb.registerHelper('owlLink', function owlHelper(subPage, text) {
    return new hb.SafeString(`<a title="${text}" href="${locals.data.owlHref + '/' + subPage}">` +
        iconTag("graduation-cap", true) + text + "</a>");
  });
}

module.exports = (options) => {

  options = _.defaults(options, {
    helpers: {},
    locals: {}
  });

  const hb = require('handlebars');

  loadDefaultHelpers(hb, options.locals);

  _.forEach(options.helpers, (fn, key) => {
    hb.registerHelper(key, fn);
  });

  function filter(text, options) {
    const hbTemplate = hb.compile(text);

    options.langPrefix = 'lang-';
    options.html = true;
    options.xhtmlOut = true;

    return loadMd(options).render(hbTemplate(text));
  }

  return filter;
};
