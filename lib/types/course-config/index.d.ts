
import moment = require('moment');
import * as url from 'url';

declare namespace config {

  export interface Author {
    name: string;

    /**
     * Email address for contact
     */
    email?: string;

    /**
     * URL where the author's homepage lives.
     */
    url?: string;

    /**
     * Contact phone number
     */
    phoneNumber?: string;
  }

  /**
   * Day of the week as Moment requires
   */
  export type DayOfWeek = "Sunday" | "Monday" | "Tuesday" | "Wednesday" |
    "Thursday" | "Friday" | "Saturday";

  export interface RepeatDefinition {
    day: DayOfWeek;
    time: string;
  }

  export interface DefaultComponentItem {

    /**
     * The duration of events in the component.
     */
    duration?: string | moment.Duration;

    /**
     * Default URL or pattern to use. If specfying a string, a lodash template may be used.
     *
     * For example: "<%= index %>-<%= title.toLowerCase().replace(/\s+/, ' ') %>"
     */
    href?: url.Url | string;

    /**
     * Keywords associated
     */
    keywords?: string[];

    /**
     * Author's who wrote an item
     */
    authors?: Author[];

    /**
     * Individuals to acknowledge
     */
    acknowledgements?: Author[];
  }

  export interface Component {

    /**
     * URL base
     */
    base: string;

    /**
     * Additional keys used to group all content by.
     */
    groupKeys?: string[];

    repeats?: RepeatDefinition[];

    defaults?: DefaultComponentItem;

    /**
     * Course Items
     */
    items: ComponentItem[];
  }

  export interface ComponentItem extends DefaultComponentItem {

    title: string;

    topic: string;

    start: string | moment.Moment;

    /**
     * End time, only specify `duration` or `end`
     */
    end?: string | moment.Moment;

    /**
     * Default URL or pattern to use. If specfying a string, a lodash template may be used.
     *
     * For example: "<%= index %>-<%= title.toLowerCase().replace(/\s+/, ' ') %>"
     */
    href?: url.Url | string;
  }

  export interface PathDefinition {

    [name: string]: PathDefinition;
  }

  /**
   * Defines a Course
   */
  export interface Course {

    /**
     * Full title of the course.
     */
    title: string;

    /**
     * Short course code.
     */
    code: string;

    paths: {
      src: string | PathDefinition;

      dist: string | PathDefinition;
    };

    /**
     * Course instructors
     */
    instructors: Author[];

    /**
     * Map of folder-name to `Component`
     */
    components: {
      [path: string]: Component;
    };
  }

}


declare namespace course {

  export class Author {

    readonly name: string;

    /**
     * Email address for contact
     */
    readonly email: string;

    /**
     * URL where the author's homepage lives.
     */
    readonly url: url.Url;

    /**
     * Contact phone number
     */
    readonly phoneNumber: string;

    constructor(props: config.Author);
  }


  export class RepeatDefinition {
    day: config.DayOfWeek;

    hours: number;
    minutes: number;

    constructor(repeat: config.RepeatDefinition);

    adjust(input: moment.Moment);
  }

  export class DefaultComponentItem {
    /**
     * The duration of events in the component.
     */
    readonly duration: moment.Duration;

    /**
     * Keywords associated
     */
    readonly keywords: string[];

    /**
     * Author's who wrote an item
     */
    readonly authors: Author[];

    /**
     * Individuals to acknowledge
     */
    readonly acknowledgements: Author[];

    constructor(props: config.DefaultComponentItem);
  }

  export class Component {

    /**
     * URL base
     */
    readonly base: string;

    /**
     * Additional keys used to group all content by.
     */
    readonly groupKeys: string[];

    readonly defaults: DefaultComponentItem;

    readonly repeats: RepeatDefinition[];

    /**
     * Course Items
     */
    readonly items: ComponentItem[];

    readonly by: { [key: string]: { [value: string]: ComponentItem[] } };

    constructor(path: string, props: config.Component);

    /**
     * Create a link from the current base.
     * @param paths subpath components.
     * @returns {string} combined path
     */
    link(...paths: string[]) : string;
  }

  export class ComponentItem {

    readonly index: number;

    readonly title: string;

    readonly topic: string;

    readonly start: moment.Moment;

    /**
     * Length of an item
     */
    readonly duration: moment.Duration;

    /**
     * End time, only specify `duration` or `end`
     */
    readonly end: moment.Moment;

    /**
     * URL part used to build up the location of an item.
     */
    readonly href: string;

    /**
     * Keywords associated
     */
    readonly keywords: string[];

    /**
     * Author's who wrote an item
     */
    readonly authors: Author[];

    /**
     * Individuals to acknowledge
     */
    readonly acknowledgements: Author[];

    constructor(index: number, props: config.ComponentItem, parent: Component);
  }

  export interface PathDefinition {

    (...subPaths: string[]): string;

    [path: string]: PathDefinition;
  }

  /**
   * Defines a Course
   */
  export class Course {

    /**
     * Full title of the course.
     */
    title: string;

    /**
     * Short course code.
     */
    code: string;

    paths: {
      src: PathDefinition;
      dist: PathDefinition;
    };

    /**
     * Course instructors
     */
    instructors: Author[];

    /**
     * Map of folder-name to `Component`
     */
    components: {
      [path: string]: Component;
    };

    constructor(props: config.Course);
  }

}
