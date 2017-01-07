

import * as hljs from 'highlight.js';

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
  const LINE_REGEX = /^\n*(\s*)[^\s]/;
  const SPACE_REGEX = /^(\s*)[^\s]/;
  queryAll('pre code').forEach((code) => {
    let content = code.innerHTML;

    let result = LINE_REGEX.exec(content);
    if (result.length > 1) {
      // trim data:
      let lines = content.split('\n');

      let i = 0;
      while (lines[i].trim().length === 0 && i <= lines.length) {
        i++;
      }

      lines.splice(0, i);

      i = lines.length-1;
      while (lines[i].trim().length === 0 && i >= 0) {
        i--;
      }
      i++;
      lines.splice(i, lines.length-i);

      let trimLength = Number.MAX_SAFE_INTEGER;
      lines.forEach(function (line) {
        let r = SPACE_REGEX.exec(line);
        if (!!r && r.length > 1) {
          trimLength = Math.min(trimLength, r[1].length);
        }
      });

      code.innerHTML = lines.map(function (l) {
        return l.substr(trimLength);
      }).join('\n');
    }

    hljs.highlightBlock(code);
  });
}
