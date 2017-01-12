

import * as hljs from 'highlight.js';
import { smartCodeTrim } from '../lib/util.js';

export function queryAll(selector: string): Element[] {
  const elems = document.querySelectorAll(selector);
  let result = new Array(elems.length);
  for (let i = 0; i < elems.length; ++i) {
    result[i] = elems[i];
  }
  return result;
}

export function fixCodeBlocks(): void {
  // Shim that trims the leading \n and then trims the minimum amount of spaces from all of the lines
  // in a code segment.
  queryAll('pre:not([class="hljs"]) code').forEach((code) => {
    code.innerHTML = smartCodeTrim(code.innerHTML);

    hljs.highlightBlock(code);
  });
}
