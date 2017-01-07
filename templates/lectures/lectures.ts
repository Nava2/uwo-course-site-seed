
import { fixCodeBlocks } from "../common";

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
});




