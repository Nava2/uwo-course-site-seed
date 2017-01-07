/**
 * Created by kevin on 02/01/2017.
 */

import { queryAll, fixCodeBlocks } from "../common";

import * as $ from 'jquery';

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

    const li = document.createElement('li');
    li.innerText = this.title;

    a.appendChild(li);
    return a;
  }

}

function initMenu() {

  let nav = document.querySelector('nav > ul.content-nav');
  let sections = queryAll('.lab-content > section').map(e => new Section(e));

  sections.forEach(section => {
    let li = document.createElement('li');
    let a = section.getAnchor();

    li.appendChild(a);

    nav.appendChild(li);

    if (section.subsections) {
    //  li.question: a(href="#question-0") Q0 - Project Setup
      let ol = document.createElement("ol");
      ol.classList.add("questions");

      section.subsections.forEach(sub => {
        let a = sub.getAnchor();
        a.classList.add("question");

        ol.appendChild(a);
      });

      nav.appendChild(ol);
    }

  });

}

$(document).ready(() => {
  fixCodeBlocks();

  initMenu();
});
