
import {fixCodeBlocks, queryAll} from "../common";

import Reveal = require('reveal.js');
import * as $ from 'jquery';

function isPresenting() {
  const url = window.location.href;

  return isPrinting() || /\?presenting\b/.test(url);
}

function isPrinting() {
  const url = window.location.href;
  return /\?printing\b/.test(url);
}

function initPresenting() {
  if (isPresenting()) {
    // we're presenting, so hide some things
    $('.rm-present').remove();
  }

  if (isPrinting()) {
    $('.visible-printing').each((idx, elem) => {
      $(elem).removeClass('visible-printing');
    })
  }
}

function initOutlines() {

  const firstSlides = queryAll('section[data-outline-title]');

  const titles = firstSlides.map(elem => elem.getAttribute('data-outline-title'));

  function createOutline(currentIndex: number): HTMLElement {
    const section = document.createElement('section');
    section.classList.add('outline');

    const h4 = document.createElement('h4');
    h4.innerText = 'Lecture Outline';

    section.appendChild(h4);

    const ul = document.createElement('ul');
    ul.classList.add('outline-list');

    titles.forEach((title, idx) => {
      const li = document.createElement('li');
      li.innerText = title;
      if (idx === currentIndex) {
        li.classList.add('fragment', 'highlight-current-blue');
      }

      ul.appendChild(li);
    });

    section.appendChild(ul);

    return section;
  }

  const slides = document.querySelector('.reveal .slides');

  firstSlides.forEach((elem, idx) => {
    slides.insertBefore(createOutline(idx), elem);
  });
}

$(() => {
  // More info https://github.com/hakimel/reveal.js#configuration
  Reveal.initialize({
    history: true,
    slideNumber: 'c/t',
    transitionSpeed: 'fast',

    dependencies: [
      { src: "/assets/lib/reveal.js/plugin/math/math.js" },
      { src: "/assets/lib/reveal.js/plugin/notes/notes.js" }
    ]
  });

  fixCodeBlocks();

  initPresenting();

  initOutlines();
});




