/**
 * Created by kevin on 02/01/2017.
 */

import { queryAll, fixCodeBlocks } from "../common";

import * as $ from 'jquery-slim';

import "jquery-slim";
import "bootstrap/js/affix";
import "bootstrap/js/scrollspy";

class Section {

  id: string;
  title: string;

  subsections?: Section[];

  constructor(public element: Element, public index?: number) {
    this.id = element.id || `question-${index}`;
    element.id = this.id;

    this.title = element.getAttribute('data-title');

    if (!this.id) {
      throw new TypeError(`Element (${element.nodeName}(class="${element.className}") does not have an ID.`);
    }

    if (!this.title) {
      throw new TypeError(`Element (${element.id}) does not have data-title attribute.`);
    }

    let children = queryAll(`#${this.id}.exercise section`);
    if (children.length > 0) {
      this.subsections = children.map((e, i) => new Section(e, i));
    }
  }

  getAnchor(): HTMLAnchorElement {
    let a = document.createElement('a');
    a.href = '#' + this.id;
    a.title = this.title;
    a.innerText = this.title;

    a.classList.add('nav-link');
    return a;
  }

}

function initMenu() {

  const locationHash = window.location.hash;

  let nav = document.querySelector('nav > ul.content-nav');
  let sections = queryAll('#lab-content > section').map(e => new Section(e));

  sections.forEach((section, idx) => {
    let li = document.createElement('li');
    li.classList.add('nav-item');

    let a = section.getAnchor();
    if (idx === 0 && locationHash === '') {
      a.classList.add('active');
    }

    if (a.hash === locationHash) {
      a.classList.add('active');
    }

    li.appendChild(a);
    nav.appendChild(li);

    if (section.subsections) {
      let ol = document.createElement("ol");
      ol.classList.add("questions", "nav");

      section.subsections.forEach(sub => {
        let a = sub.getAnchor();
        a.classList.add("question");
        if (a.hash === locationHash) {
          a.classList.add('active');
        }

        let li = document.createElement("li");
        li.classList.add("nav-item");

        li.appendChild(a);
        ol.appendChild(li);
      });

      nav.appendChild(ol);
    }

  });

  if (locationHash.length > 0) {
    window.location.hash = '';
    window.location.hash = locationHash;
  }

}

$(document).ready(() => {
  fixCodeBlocks();

  initMenu();

  $('#lab-content').scrollspy();
});
