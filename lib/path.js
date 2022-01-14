'use strict';

const path = require('path-browserify');
const isString = require('lodash/isString');
const helpers = module.exports;

/**
 * Get the directory path segment from the given `filepath`.
 *
 * ```handlebars
 * {{dirname "docs/toc.md"}}
 * <!-- results in: 'docs' -->
 * ```
 * @param {String} `filepath`
 * @return {String}
 * @api public
 */

helpers.dirname = function(filepath) {
  if (!isString(filepath)) {
    return '';
  }
  return path.dirname(filepath);
};

/**
 * Get the relative filepath from `a` to `b`.
 *
 * ```handlebars
 * {{relative a b}}
 * ```
 * @param {String} `a`
 * @param {String} `b`
 * @return {String}
 * @api public
 */

helpers.relative = function(a, b) {
  if (!isString(a) || !isString(b)) {
    return '';
  }
  return path.relative(a, b);
};

/**
 * Get the file extension from the given `filepath`.
 *
 * ```handlebars
 * {{basename "docs/toc.md"}}
 * <!-- results in: 'toc.md' -->
 * ```
 * @param {String} `ext`
 * @return {String}
 * @api public
 */

helpers.basename = function(filepath) {
  if (!isString(filepath)) {
    return '';
  }
  return path.basename(filepath);
};

/**
 * Get the "stem" from the given `filepath`.
 *
 * ```handlebars
 * {{stem "docs/toc.md"}}
 * <!-- results in: 'toc' -->
 * ```
 * @param {String} `filepath`
 * @return {String}
 * @api public
 */

helpers.stem = function(filepath) {
  if (!isString(filepath)) {
    return '';
  }
  return path.basename(filepath, path.extname(filepath));
};

/**
 * Get the file extension from the given `filepath`.
 *
 * ```handlebars
 * {{extname "docs/toc.md"}}
 * <!-- results in: '.md' -->
 * ```
 * @param {String} `filepath`
 * @return {String}
 * @api public
 */

helpers.extname = function(filepath) {
  if (!isString(filepath)) {
    return '';
  }
  return path.extname(filepath);
};

/**
 * Get specific (joined) segments of a file path by passing a
 * range of array indices.
 *
 * ```handlebars
 * {{segments "a/b/c/d" "2" "3"}}
 * <!-- results in: 'c/d' -->
 *
 * {{segments "a/b/c/d" "1" "3"}}
 * <!-- results in: 'b/c/d' -->
 *
 * {{segments "a/b/c/d" "1" "2"}}
 * <!-- results in: 'b/c' -->
 * ```
 *
 * @param {String} `filepath` The file path to split into segments.
 * @return {String} Returns a single, joined file path.
 * @api public
 */

helpers.segments = function(filepath, a, b) {
  if (!isString(filepath)) {
    return '';
  }
  const segments = filepath.split(/[\\\/]+/);
  return segments.slice(a, b).join('/');
};
