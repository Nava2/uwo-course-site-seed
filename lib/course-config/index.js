
const _ = require('lodash');
const course = require('./course');

/**
 * Validate the configuration and return a value with useful methods.
 *
 * @param props
 * @returns {Course}
 */
function CourseConfig(props) {
  return new course.Course(props);
}

_.forEach(course, (clazz, key) => { CourseConfig[key] = clazz; });

module.exports = CourseConfig;
