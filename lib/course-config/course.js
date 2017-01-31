"use strict";

const path = require('path');
const url = require("url");

const _ = require('lodash');
const moment = require('moment');
const padLeft = require('pad-left');

const isEmail = require('validator/lib/isEmail');
const isURL = require('validator/lib/isURL');
const isMobilePhone = require('validator/lib/isMobilePhone');
const normalizeEmail = require('validator/lib/normalizeEmail');

function isNotEmpty(str) {
  return str !== '';
}

function check(conditional, value) {
  if (conditional(value)) {
    return value;
  } else {
    throw new TypeError('check: Failed validation: ' + conditional);
  }
}

class Author {

  constructor(props) {
    this.name = props.name;

    if (!!props.email) {
      /**
       * Email address for contact
       */
      this.email = normalizeEmail(check(isEmail, props.email));
    }

    if (!!props.url) {
      if (_.isString(props.url)) {
        /**
         * URL where the author's homepage lives.
         */
        this.url = url.parse(check(isURL, props.url));
      } else {
        this.url = props.url;
      }
    }

    if (!!props.phoneNumber) {
      /**
       * Contact phone number
       */
      this.phoneNumber = check(function isPhone(phone) {
        return isMobilePhone(phone, 'en-GB');
      }, props.phoneNumber);
    }
  }
}

class RepeatDefinition {

  constructor(repeat) {
    this.day = repeat.day;

    const m = moment(repeat.time, "hh:mm");

    this.hours = m.hours();
    this.minutes = m.minutes();
  }

  /**
   *
   * @param {moment} input
   * @returns {moment}
   */
  adjust(input) {
    return input.clone().day(this.day).hours(this.hours).minutes(this.minutes);
  }
}

class DefaultComponentItem {

  constructor(props) {
    _.defaults(props, {
      keywords: [],
      authors: [],
      acknowledgements: [],
      external: false
    });

    if (!!props.duration) {
      /**
       * The duration of events in the component.
       * @type {moment.Duration}
       */
      this.duration = moment.duration(props.duration);
    }

    this.title = props.title;

    /**
     * URL path
     */
    this.href = props.href;

    /**
     * If true, it means the resource is externally hosted
     * @type {boolean}
     */
    this.external = props.external;

    /**
     * Keywords associated
     */
    this.keywords = props.keywords;

    /**
     * Author's who wrote an item
     */
    this.authors = props.authors.map(a => new Author(a));

    /**
     * Individuals to acknowledge
     */
    this.acknowledgements = props.acknowledgements.map(a => new Author(a));
  }
}

class Component {

  constructor(course, rootDir, props) {

    this.course = course;

    this.rootDir = rootDir;

    /**
     * URL base
     */
    this.base = check(_.isString, props.base);

    /**
     * Additional keys used to group all content by.
     */
    this.groupKeys = props.groupKeys || [];
    this.repeats = (props.repeats && props.repeats.map(r => new RepeatDefinition(r))) || [];

    this.defaults = new DefaultComponentItem(props.defaults);

    /**
     * Course Items
     */
    this.items = props.items.map((item, idx) => (new ComponentItem(this, idx, item)));

    this.by = _(this.groupKeys)
      .map(key => ([key, _.groupBy(this.items, key)]))
      .fromPairs()
      .value();

    this.by['file'] = _.fromPairs(this.items.map(it => {
      return [it.href.substring(it.href.lastIndexOf('/') + 1), it];
    }));
  }

  /**
   * Create a link from the current base.
   * @param paths subpath components.
   * @returns {string} combined path
   */
  link(...paths) {
    return ('/' +
    _([this.base, paths]).flatten()
      .compact()
      .join('/'))
      .replace(/\/{2,}/g, '/');
  }
}

const HAS_TEMPLATE_R = /<%=.+%>/g;

class ComponentItem {

  constructor(parent, index, props) {

    let toTemplate = [];
    const template = (property, value) => {
      if (!!value) {
        if (value.match(HAS_TEMPLATE_R)) {
          toTemplate.push([property, value]);
        } else {
          this[property] = value.trim();
        }
      }
    };

    this.component = parent;
    this.external = props.external;
    this.ext = props.ext;

    this.index = index;
    this.indexStr = padLeft(index, 2, '0');
    template('title', check(isNotEmpty, props.title || parent.defaults.title));
    template('topic', props.topic);

    this.keywords = props.keywords || parent.defaults.keywords;

    this.start = moment(props.start);

    if (!!props.end) {
      // end is defined, calculate the duration
      this.end = moment(props.end);
      this.duration = moment.duration(this.end.diff(this.start));
    } else {
      this.duration = moment.duration(props.duration);
      this.end = this.start.clone().add(this.duration);
    }

    if (!(props.href || parent.defaults.href)) {
      throw new TypeError("ComponentItem.href not set (nor default).");
    }

    template('href', parent.link(props.href || parent.defaults.href));

    let options = _.extend({
      cleanTitle: () => this.title.toLowerCase()
        .replace(/\band\b/g, '')
        .replace(/\bor\b/g, '')
        .replace(/\s+/g, '-')
    }, this);

    // Run any property that needs templated values through the ejs _.template()
    toTemplate.forEach(([key, value]) => {
      const template = _.template(value);
      this[key] = template(options);
      options[key] = this[key];
    });

    this.authors = !!props.authors ? props.authors.map(a => new Author(a)) : parent.defaults.authors;

    this.acknowledgements = (!!props.acknowledgements
      ? props.acknowledgements.map(a => new Author(a))
      : parent.defaults.acknowledgements);
  }
}

/**
 * Defines a Course
 */
class Course {

  /**
   * Create a new instance based on configuration details
   * @param props
   */
  constructor(props) {
    /**
     * Full title of the course.
     */
    this.title = check(isNotEmpty, props.title);

    /**
     * Short course code.
     */
    this.code = check(isNotEmpty, props.code);

    if (!props.instructors) {
      throw new TypeError('Must specify instructors');
    }

    this.learningPlatformHrefBase = props.learningPlatformHrefBase;

    /**
     * Course instructors
     */
    this.instructors = props.instructors.map(inst => (new Author(inst)));

    /**
     * Map of folder-name to `Component`
     */
    this.components = _(props.components || {})
      .map((component, name) => ([path.basename(name), new Component(this, name, component)]))
      .fromPairs()
      .value();
  }
}

module.exports = {
  Author: Author,

  RepeatDefinition: RepeatDefinition,

  DefaultComponentItem: DefaultComponentItem,

  Component: Component,

  ComponentItem: ComponentItem,

  Course: Course,
};
