/**
 * Defines common behaviours for the main.layout.pug file.
 */

import * as hljs from "highlight.js";
import * as keyboardJS from "keyboardJS";
import { queryAll } from "./common";

import * as moment from 'moment';
import * as $ from 'jquery';

import 'jquery';
import 'bootstrap/js/dropdown';
import 'bootstrap/js/tab';

function hideDateEnabled() {

  const DATE_AVAILABLE_ATTR = 'data-available-date';
  const AVAILABLE = moment().add(7, 'days');
  queryAll('.date-enabled').forEach(elem => {
    const checkData = moment(elem.getAttribute(DATE_AVAILABLE_ATTR));

    if (!/\bhidden\b/.test(elem.className) && checkData.isAfter(AVAILABLE)) {
      elem.className += ' hidden';
    }
  });
}

$().ready(() => {
  const PRESENTER_REGEX = /\?presenting$/;

  let isPresenting = false;

  keyboardJS.bind('alt + k + b', () => {
    isPresenting = !isPresenting;

    queryAll('.date-enabled a.presentation').forEach((elem: HTMLAnchorElement) => {

      let href: string = elem.href;

      let res = PRESENTER_REGEX.exec(href);

      if (isPresenting && res == null) {
        href += '?presenting';
      } else if (!isPresenting && res) {
        href.replace(PRESENTER_REGEX, '');
      }

      elem.href = href;
    });

    if (isPresenting) {
      queryAll('.date-enabled.hidden').forEach( (elem: Element) => {
        elem.className = elem.className.replace(/\s*hidden\s*/, '');
      });
    } else {
      hideDateEnabled();
    }
  });

  hideDateEnabled();

  hljs.initHighlighting();
});


