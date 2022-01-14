'use strict';

const util = require('handlebars-utils');
const micromatch = require('micromatch');
const helpers = module.exports;

/**
 * Returns true if a filepath contains the given pattern.
 * Options may be passed on the options hash or locals.
 *
 * ```handlebars
 * {{isMatch "foo.md" "*.md"}}
 * <!-- results in: true -->
 * ```
 *
 * @param {String} `filepath`
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {Boolean}
 * @api public
 */

helpers.isMatch = function(files, patterns, locals, options) {
  const opts = util.options(this, locals, options);
  return micromatch.isMatch(files, patterns, opts);
};
