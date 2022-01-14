'use strict';

const util = require('handlebars-utils');
const helpers = module.exports;

/**
 * Encodes a Uniform Resource Identifier (URI) component
 * by replacing each instance of certain characters by
 * one, two, three, or four escape sequences representing
 * the UTF-8 encoding of the character.
 *
 * @param {String} `str` The un-encoded string
 * @return {String} The endcoded string
 * @api public
 */

helpers.encodeURIComponent = function(str) {
  if (util.isString(str)) {
    return encodeURIComponent(str);
  }
};

/**
 * Decode a Uniform Resource Identifier (URI) component.
 *
 * @param {String} `str`
 * @return {String}
 * @api public
 */

helpers.decodeURIComponent = function(str) {
  if (util.isString(str)) {
    return decodeURIComponent(str);
  }
};

/**
 * Take a base URL and a href URL and resolve them as a
 * browser would for an anchor tag.
 *
 * ```handlebars
 * {{urlResolve "http://example.com" "one"}}
 * //=> 'http://example.com/one'
 *
 * {{urlResolve "http://example.com/" "/one"}}
 * //=> 'http://example.com/one'
 *
 * {{urlResolve "http://example.com/one" "/two"}}
 * //=> 'http://example.com/two'
 *
 * {{urlResolve "http://example.com/one/" "two"}}
 * //=> 'http://example.com/one/two'
 *
 * {{urlResolve "http://example.com/one/" "./two"}}
 * //=> 'http://example.com/one/two'
 *
 * {{urlResolve "http://example.com/one" "./two"}}
 * //=> 'http://example.com/two'
 * ```
 *
 * @param {String} `base`
 * @param {String} `href`
 * @return {String}
 * @api public
 */

helpers.urlResolve = function(base, href) {
  try {
    const u = new URL(href, base);
    return u.toString();
  } catch {
    return '';
  }
};

/**
 * Parses a `url` string into an object.
 *
 * @param {String} `str` URL string
 * @return {String} Returns URL object
 * @api public
 */

helpers.urlParse = function(str) {
  try {
    return new URL(str);
  } catch {
    return '';
  }
};

/**
 * Strip the query string from the given `url`.
 *
 * @param {String} `url`
 * @return {String} the url without the queryString
 * @api public
 */

helpers.stripQuerystring = function(str) {
  if (util.isString(str)) {
    return str.split('?')[0];
  }
  return str;
};
