/*!
 * create-frame <https://github.com/jonschlinkert/create-frame>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

const forOwn = require('lodash/forOwn');
const isPlainObject = require('lodash/isPlainObject');
const tail = require('lodash/tail');

function extend(a, b) {
  forOwn(b, (val, key) => {
    a[key] = val;
  });
}

module.exports = function createFrame(data) {
  if (!isPlainObject(data)) {
    throw new TypeError('createFrame expects data to be an object');
  }

  const frame = {...data, _parent: data};

  Object.defineProperty(frame, 'extend', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: function(data) {
      extend(this, data);
    }
  });

  if (arguments.length > 1) {
    const args = tail(arguments);
    const len = args.length;
    let i = -1;
    while (++i < len) {
      frame.extend(args[i] || {});
    }
  }

  return frame;
};
