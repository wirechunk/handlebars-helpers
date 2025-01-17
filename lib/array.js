'use strict';

const getValue = require('get-value');
const dropRight = require('lodash/dropRight');
const sortBy = require('lodash/sortBy');
const union = require('lodash/union');
const uniq = require('lodash/uniq');
const uniqBy = require('lodash/uniqBy');
const util = require('handlebars-utils');
const isFunction = require('lodash/isFunction');
const isNumber = require('lodash/isNumber');
const isString = require('lodash/isString');
const createFrame = require('../create-frame');

const helpers = module.exports;

/**
 * Returns all of the items in an array, or characters in a string, after the specified index.
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c'] -->
 * {{after array 1}}
 * <!-- results in: '["c"]' -->
 * ```
 * @param {Array|String} `value` Collection
 * @param {Number} `n` Starting index (number of items to exclude)
 * @return {Array} Array or string excluding `n` items.
 * @api public
 */

helpers.after = function(value, n) {
  if (!Array.isArray(value) && !isString(value)) {
    return '';
  }
  return value.slice(n);
};

/**
 * Combine the given values into an array.
 *
 * ```handlebars
 * {{toArray "foo"}}
 * <!-- results in: [ "foo" ] -->
 *
 * {{toArray "foo" "bar"}}
 * <!-- results in: [ "foo", "bar" ] -->
 * ```
 * @param {...any} `values`
 * @return {Array}
 * @api public
 */

helpers.toArray = (...values) => {
  // Omit the Handlebars options object.
  return dropRight(values, 1);
};

/**
 * ```handlebars
 * <!-- array: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] -->
 * {{#eachIndex array}}
 *   {{item}} is {{index}}
 * {{/eachIndex}}
 * ```
 * @param {Array} `array`
 * @param {Object} `options`
 * @return {String}
 * @block
 * @api public
 */

helpers.eachIndex = function(array, options) {
  let result = '';
  for (let i = 0; i < array.length; i++) {
    result += options.fn({item: array[i], index: i});
  }
  return result;
};

/**
 * Returns an array with the given array's elements filtered for elements that equal a specified value
 * or, if a hash argument with a "property" key is provided, for elements that have the specified
 * property equal to a specified value.
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'a', 'c'] -->
 * {{filter array "a"}}
 * <!-- results in: ['a', 'a'] -->
 *
 * <!-- array: [{ x: 'a' }, { x: 'b' }, { x: 'a' }, { x: 'c' }] -->
 * {{filter array "a" property="x"}}
 * <!-- results in: [{ x: 'a'}, { x: 'a' }] -->
 * ```
 * @param {Array} `array`
 * @param {any} `value`
 * @param {Object} `options`
 * @return {Array}
 * @block
 * @api public
 */

helpers.filter = function(array, value, options) {
  if (!Array.isArray(array)) {
    return '';
  }

  const prop = options?.hash?.property;
  if (prop) {
    // Filter on a specific property.
    return array.filter(function(val) {
      return value === getValue(val, prop);
    });
  }

  // Filter by equality with value.
  return array.filter(function(v) {
    return value === v;
  });
};

/**
 * Returns the first item, or first `n` items of an array.
 *
 * ```handlebars
 * {{first "['a', 'b', 'c', 'd', 'e']" 2}}
 * <!-- results in: '["a", "b"]' -->
 * ```
 * @param {Array} `array`
 * @param {Number} `n` Number of items to return, starting at `0`.
 * @return {Array}
 * @api public
 */

helpers.first = function(array, n) {
  if (util.isUndefined(array)) return '';
  if (!isNumber(n)) {
    return array[0];
  }
  return array.slice(0, n);
};

/**
 * Iterates over each item in an array and exposes the current item
 * in the array as context to the inner block. In addition to
 * the current array item, the helper exposes the following variables
 * to the inner block:
 *
 * - `index`
 * - `total`
 * - `isFirst`
 * - `isLast`
 *
 * Also, `@index` is exposed as a private variable, and additional
 * private variables may be defined as hash arguments.
 *
 * ```handlebars
 * <!-- accounts = [
 *   {'name': 'John', 'email': 'john@example.com'},
 *   {'name': 'Malcolm', 'email': 'malcolm@example.com'},
 *   {'name': 'David', 'email': 'david@example.com'}
 * ] -->
 *
 * {{#forEach accounts}}
 *   <a href="mailto:{{ email }}" title="Send an email to {{ name }}">
 *     {{ name }}
 *   </a>{{#unless isLast}}, {{/unless}}
 * {{/forEach}}
 * ```
 * @source <http://stackoverflow.com/questions/13861007>
 * @param {Array} `array`
 * @return {String}
 * @block
 * @api public
 */

helpers.forEach = function(array, options) {
  const data = createFrame(options, options.hash);
  const len = array.length;
  let buffer = '';
  let i = -1;

  while (++i < len) {
    const item = array[i];
    data.index = i;
    item.index = i + 1;
    item.total = len;
    item.isFirst = i === 0;
    item.isLast = i === (len - 1);
    buffer += options.fn(item, {data: data});
  }
  return buffer;
};

/**
 * Block helper that renders the block if an array has the
 * given `value`. Optionally specify an inverse block to render
 * when the array does not have the given value.
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c'] -->
 * {{#inArray array "d"}}
 *   foo
 * {{else}}
 *   bar
 * {{/inArray}}
 * <!-- results in: 'bar' -->
 * ```
 * @param {Array} `array`
 * @param {any} `value`
 * @param {Object} `options`
 * @return {String}
 * @block
 * @api public
 */

helpers.inArray = function(array, value, options) {
  return util.value(util.indexOf(array, value) > -1, this, options);
};

/**
 * Returns true if `value` is an es5 array.
 *
 * ```handlebars
 * {{isArray "abc"}}
 * <!-- results in: false -->
 *
 * <!-- array: [1, 2, 3] -->
 * {{isArray array}}
 * <!-- results in: true -->
 * ```
 * @param {any} `value` The value to test.
 * @return {Boolean}
 * @api public
 */

helpers.isArray = function(value) {
  return Array.isArray(value);
};

/**
 * Returns the item from `array` at index `idx`.
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c'] -->
 * {{itemAt array 1}}
 * <!-- results in: 'b' -->
 * ```
 * @param {Array} `array`
 * @param {Number} `idx`
 * @return {any} `value`
 * @block
 * @api public
 */

helpers.itemAt = function(array, idx) {
  array = util.result(array);
  if (Array.isArray(array)) {
    idx = isNumber(idx) ? +idx : 0;
    if (idx < 0) {
      return array[array.length + idx];
    }
    if (idx < array.length) {
      return array[idx];
    }
  }
};

/**
 * Join all elements of array into a string, optionally using a
 * given separator.
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c'] -->
 * {{join array}}
 * <!-- results in: 'a, b, c' -->
 *
 * {{join array '-'}}
 * <!-- results in: 'a-b-c' -->
 * ```
 * @param {Array} `array`
 * @param {String} `separator` The separator to use. Defaults to `, `.
 * @return {String}
 * @api public
 */

helpers.join = function(array, separator) {
  if (typeof array === 'string') return array;
  if (!Array.isArray(array)) return '';
  separator = util.isString(separator) ? separator : ', ';
  return array.join(separator);
};

/**
 * Returns true if the the length of the given `value` is equal
 * to the given `length`. Can be used as a block or inline helper.
 *
 * @param {Array|String} `value`
 * @param {Number} `length`
 * @param {Object} `options`
 * @return {String}
 * @block
 * @api public
 */

helpers.hasLength = function(value, length, options) {
  if (util.isOptions(length)) {
    options = length;
    length = 0;
  }

  let len = 0;
  if (typeof value === 'string' || Array.isArray(value)) {
    len = value.length;
  }

  return util.value(len === length, this, options);
};

/**
 * Returns the last item, or last `n` items of an array or string.
 * Opposite of [first](#first).
 *
 * ```handlebars
 * <!-- var value = ['a', 'b', 'c', 'd', 'e'] -->
 *
 * {{last value}}
 * <!-- results in: ['e'] -->
 *
 * {{last value 2}}
 * <!-- results in: ['d', 'e'] -->
 *
 * {{last value 3}}
 * <!-- results in: ['c', 'd', 'e'] -->
 * ```
 * @param {Array|String} `value` Array or string.
 * @param {Number} `n` Number of items to return from the end of the array.
 * @return {Array}
 * @api public
 */

helpers.last = function(value, n) {
  if (!Array.isArray(value) && typeof value !== 'string') {
    return '';
  }
  if (!isNumber(n)) {
    return value[value.length - 1];
  }
  return value.slice(-Math.abs(n));
};

/**
 * Returns the length of the given string or array.
 *
 * ```handlebars
 * {{length '["a", "b", "c"]'}}
 * <!-- results in: 3 -->
 *
 * <!-- results in: myArray = ['a', 'b', 'c', 'd', 'e']; -->
 * {{length myArray}}
 * <!-- results in: 5 -->
 *
 * <!-- results in: myObject = {'a': 'a', 'b': 'b'}; -->
 * {{length myObject}}
 * <!-- results in: 2 -->
 * ```
 * @param {Array|Object|String} `value`
 * @return {Number} The length of the value.
 * @api public
 */

helpers.length = function(value) {
  if (util.isObject(value) && !util.isOptions(value)) {
    value = Object.keys(value);
  }
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length;
  }
  return 0;
};

/**
 * Returns a new array, created by calling `function` on each
 * element of the given `array`. For example,
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c'], and "double" is a
 * fictitious function that duplicates letters -->
 * {{map array double}}
 * <!-- results in: '["aa", "bb", "cc"]' -->
 * ```
 *
 * @param {Array} `array`
 * @param {Function} `fn`
 * @return {String}
 * @api public
 */

helpers.map = function(array, iter) {
  if (!Array.isArray(array)) return '';
  const len = array.length;
  const res = new Array(len);
  let i = -1;

  if (typeof iter !== 'function') {
    return array;
  }

  while (++i < len) {
    res[i] = iter(array[i], i, array);
  }
  return res;
};

/**
 * Map over the given object or array or objects and create an array of values
 * from the given `prop`. Dot-notation may be used (as a string) to get
 * nested properties.
 *
 * ```handlebars
 * // {{pluck items "data.title"}}
 * <!-- results in: '["aa", "bb", "cc"]' -->
 * ```
 * @param {Array|Object} `collection`
 * @param {Function} `prop`
 * @return {String}
 * @api public
 */

helpers.pluck = function(arr, prop) {
  if (util.isUndefined(arr)) return '';
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    const val = getValue(arr[i], prop);
    if (typeof val !== 'undefined') {
      res.push(val);
    }
  }
  return res;
};

/**
 * Reverse the elements in an array or the characters in a string.
 *
 * ```handlebars
 * <!-- value: 'abcd' -->
 * {{reverse value}}
 * <!-- results in: 'dcba' -->
 *
 * <!-- value: ['a', 'b', 'c', 'd'] -->
 * {{reverse value}}
 * <!-- results in: ['d', 'c', 'b', 'a'] -->
 * ```
 * @param {Array|String} `value`
 * @return {Array|String} Returns the reversed string or array.
 * @api public
 */

helpers.reverse = function(val) {
  if (Array.isArray(val)) {
    val.reverse();
    return val;
  }
  if (val && isString(val)) {
    return val.split('').reverse().join('');
  }
  return '';
};

/**
 * Block helper that returns the block if the callback returns true
 * for some value in the given array.
 *
 * ```handlebars
 * <!-- array: [1, 'b', 3] -->
 * {{#some array isString}}
 *   Render me if the array has a string.
 * {{else}}
 *   Render me if it doesn't.
 * {{/some}}
 * <!-- results in: 'Render me if the array has a string.' -->
 * ```
 * @param {Array} `array`
 * @param {Function} `iter` Iteratee
 * @param {Options} Handlebars provided options object
 * @return {String}
 * @block
 * @api public
 */

helpers.some = function(array, iter, options) {
  if (Array.isArray(array)) {
    for (let i = 0; i < array.length; i++) {
      if (iter(array[i], i, array)) {
        return options.fn(this);
      }
    }
  }
  return options.inverse(this);
};

/**
 * Sort the given `array`. If an array of objects is passed,
 * you may optionally pass a `key` to sort on as the second
 * argument. You may alternatively pass a sorting function as
 * the second argument.
 *
 * ```handlebars
 * <!-- array: ['b', 'a', 'c'] -->
 * {{sort array}}
 * <!-- results in: '["a", "b", "c"]' -->
 * ```
 *
 * @param {Array} `array` the array to sort.
 * @param {String|Function} `key` The object key to sort by, or sorting function.
 * @api public
 */

helpers.sort = function(array, options) {
  if (!Array.isArray(array)) return '';
  if (getValue(options, 'hash.reverse')) {
    return array.sort().reverse();
  }
  return array.sort();
};

/**
 * Sort an `array`. If an array of objects is passed,
 * you may optionally pass a `key` to sort on as the second
 * argument. You may alternatively pass a sorting function as
 * the second argument.
 *
 * ```handlebars
 * <!-- array: [{a: 'zzz'}, {a: 'aaa'}] -->
 * {{sortBy array "a"}}
 * <!-- results in: '[{"a":"aaa"}, {"a":"zzz"}]' -->
 * ```
 *
 * @param {Array} `array` the array to sort.
 * @param {String|Array<String>|Function} `props` One or more properties to sort by, or sorting function to use.
 * @return {Array}
 * @api public
 */

helpers.sortBy = (array, ...props) => {
  if (!Array.isArray(array)) {
    return [];
  }
  // The last element of props is the Handlebars options.
  const sortProps = dropRight(props, 1);
  if (!isString(sortProps) && !Array.isArray(sortProps) && !isFunction(sortProps)) {
    return array.sort();
  }

  return sortBy(array, sortProps);
};

/**
 * Use the items in the array _after_ the specified index
 * as context inside a block.
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c', 'd', 'e'] -->
 * {{#withAfter array 3}}
 *   {{this}}
 * {{/withAfter}}
 * <!-- results in: "de" -->
 * ```
 * @param {Array} `array`
 * @param {Number} `idx`
 * @param {Object} `options`
 * @return {Array}
 * @block
 * @api public
 */

helpers.withAfter = function(array, idx, options) {
  if (!Array.isArray(array)) return '';
  array = array.slice(idx);
  let result = '';

  for (let i = 0; i < array.length; i++) {
    result += options.fn(array[i]);
  }
  return result;
};

/**
 * Use the first item in a collection inside a handlebars
 * block expression. Opposite of [withLast](#withLast).
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c'] -->
 * {{#withFirst array}}
 *   {{this}}
 * {{/withFirst}}
 * <!-- results in: 'a' -->
 * ```
 * @param {Array} `array`
 * @param {Number} `idx`
 * @param {Object} `options`
 * @return {String}
 * @block
 * @api public
 */

helpers.withFirst = function(array, idx, options) {
  if (util.isUndefined(array)) return '';
  array = util.result(array);

  if (!util.isUndefined(idx)) {
    idx = parseFloat(util.result(idx));
  }

  if (util.isUndefined(idx)) {
    options = idx;
    return options.fn(array[0]);
  }

  array = array.slice(0, idx);
  let result = '';
  for (let i = 0; i < array.length; i++) {
    result += options.fn(array[i]);
  }
  return result;
};

/**
 * Block helper that groups array elements by given group `size`.
 *
 * ```handlebars
 * <!-- array: ['a','b','c','d','e','f','g','h'] -->
 * {{#withGroup array 4}}
 *   {{#each this}}
 *     {{.}}
 *   {{each}}
 *   <br>
 * {{/withGroup}}
 * <!-- results in: -->
 * <!-- 'a','b','c','d'<br> -->
 * <!-- 'e','f','g','h'<br> -->
 * ```
 * @param {Array} `array` The array to iterate over
 * @param {Number} `size` The desired length of each array "group"
 * @param {Object} `options` Handlebars options
 * @return {String}
 * @block
 * @api public
 */

helpers.withGroup = function(array, size, options) {
  let result = '';
  if (Array.isArray(array) && array.length > 0) {
    let subcontext = [];
    for (let i = 0; i < array.length; i++) {
      if (i > 0 && (i % size) === 0) {
        result += options.fn(subcontext);
        subcontext = [];
      }
      subcontext.push(array[i]);
    }
    result += options.fn(subcontext);
  }
  return result;
};

/**
 * Use the last item or `n` items in an array as context inside a block.
 * Opposite of [withFirst](#withFirst).
 *
 * ```handlebars
 * <!-- array: ['a', 'b', 'c'] -->
 * {{#withLast array}}
 *   {{this}}
 * {{/withLast}}
 * <!-- results in: 'c' -->
 * ```
 * @param {Array} `array`
 * @param {Number} `idx` The starting index.
 * @param {Object} `options`
 * @return {String}
 * @block
 * @api public
 */

helpers.withLast = function(array, idx, options) {
  if (util.isUndefined(array)) return '';
  array = util.result(array);

  if (!util.isUndefined(idx)) {
    idx = parseFloat(util.result(idx));
  }

  if (util.isUndefined(idx)) {
    options = idx;
    return options.fn(array[array.length - 1]);
  }

  array = array.slice(-idx);
  const len = array.length;
  let i = -1;
  let result = '';
  while (++i < len) {
    result += options.fn(array[i]);
  }
  return result;
};

/**
 * Block helper that sorts a collection and exposes the sorted
 * collection as context inside the block.
 *
 * ```handlebars
 * <!-- array: ['b', 'a', 'c'] -->
 * {{#withSort array}}{{this}}{{/withSort}}
 * <!-- results in: 'abc' -->
 * ```
 * @param {Array} `array`
 * @param {String} `prop`
 * @param {Object} `options` Specify `reverse="true"` to reverse the array.
 * @return {String}
 * @block
 * @api public
 */

helpers.withSort = function(array, prop, options) {
  if (util.isUndefined(array)) return '';
  let result = '';

  if (util.isUndefined(prop)) {
    options = prop;

    array = array.sort();
    if (getValue(options, 'hash.reverse')) {
      array = array.reverse();
    }

    for (let i = 0, len = array.length; i < len; i++) {
      result += options.fn(array[i]);
    }
    return result;
  }

  array.sort(function(a, b) {
    a = getValue(a, prop);
    b = getValue(b, prop);
    return a > b ? 1 : (a < b ? -1 : 0);
  });

  if (getValue(options, 'hash.reverse')) {
    array = array.reverse();
  }

  const alen = array.length;
  let j = -1;
  while (++j < alen) {
    result += options.fn(array[j]);
  }
  return result;
};

/**
 * Returns an array of all of the unique values from the two given arrays.
 * Elements are compared using [SameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness),
 * which is similar to strict equality except that NaN is considered equal to NaN.
 */
helpers.union = function(arrayA, arrayB) {
  if (!Array.isArray(arrayA) || !Array.isArray(arrayB)) {
    return [];
  }

  return union(arrayA, arrayB);
};

/**
 * Returns an array with all duplicate values removed.
 * Elements are compared using [SameValueZero](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness),
 * which is similar to strict equality except that NaN is considered equal to NaN.
 *
 * ```handlebars
 * <!-- array: ['a', 'a', 'c', 'b', 'e', 'e'] -->
 * {{#each (unique array)}}{{.}}{{/each}}
 * <!-- results in: 'acbe' -->
 * ```
 * @param {Array} `array`
 * @param {Object} `options`
 * @return {Array}
 * @api public
 */

helpers.unique = function(array) {
  if (!Array.isArray(array)) {
    return [];
  }

  return uniq(array);
};

/**
 * Returns an array with all duplicate values removed using the property or comparison
 * function specified.
 *
 * ```handlebars
 * <!-- array: [{a: 'zz', id: 1}, {a: 'aa', id: 2}, {a: 'zz', id: 3}] -->
 * {{uniqueBy array "a"}}
 * <!-- results in: [{ a: "zz", id: 1}, { a: "aa", id: 2 }] -->
 * ```
 *
 * @param {Array} `array`
 * @param {String|Function} `prop` The property or comparison function by which to determine uniqueness.
 * @return {Array}
 * @api public
 */

helpers.uniqueBy = (array, prop) => {
  if (!Array.isArray(array)) {
    return [];
  }
  if (!isString(prop) && !isFunction(prop)) {
    return uniq(array);
  }

  return uniqBy(array, prop);
};
