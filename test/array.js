'use strict';

require('mocha');
const assert = require('assert');
const hbs = require('handlebars').create();
const arrayHelpers = require('../lib/array');
const objectHelpers = require('../lib/object');
const stringHelpers = require('../lib/string');

hbs.registerHelper(arrayHelpers);
hbs.registerHelper(objectHelpers);
hbs.registerHelper(stringHelpers);

const context = {
  array: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  duplicate: ['a', 'b', 'b', 'c', 'd', 'b', 'f', 'a', 'g']
};

describe('array', function() {
  describe('after', function() {
    it('should return an empty string when undefined', function() {
      assert.equal(hbs.compile('{{after}}')(), '');
    });

    it('should return all of the items in an array after the given index', function() {
      const fn = hbs.compile('{{after array 5}}');
      assert.equal(fn(context), 'f,g,h');
    });

    it('should return the part of a string after the given index', function() {
      const fn = hbs.compile('{{after str 2}}');
      assert.equal(fn({str: 'abcd'}), 'cd');
    });
  });

  describe('toArray', function() {
    it('should convert a single value to an array with that value', function() {
      assert.equal(hbs.compile('{{{JSONstringify (toArray .)}}}')('foo'), '["foo"]');
    });

    it('should convert multiple values', function() {
      assert.equal(hbs.compile('{{JSONstringify (toArray 1 2 3)}}')(), '[1,2,3]');
    });
  });

  describe('each', function() {
    it('should use the key and value of each property in an object inside a block', function() {
      const fn = hbs.compile('{{#each obj}}{{@key}}: {{this}} {{/each}}');
      assert.equal(fn({obj: {fry: 3, bender: 120}}), 'fry: 3 bender: 120 ');
    });
  });

  describe('eachIndex', function() {
    it('should render the block using the array and each item\'s index', function() {
      const fn = hbs.compile('{{#eachIndex array}} {{item}} is {{index}} {{/eachIndex}}');
      assert.equal(fn(context), ' a is 0  b is 1  c is 2  d is 3  e is 4  f is 5  g is 6  h is 7 ');
    });
  });

  describe('first', function() {
    it('should return the first item in a collection', function() {
      const fn = hbs.compile('{{first foo}}');
      assert.equal(fn({foo: ['a', 'b', 'c']}), 'a');
    });

    it('should return an array with the first two items in a collection', function() {
      const fn = hbs.compile('{{first foo 2}}');
      assert.equal(fn({foo: ['a', 'b', 'c']}), 'a,b');
    });

    it('should return an empty string when undefined', function() {
      assert.equal(hbs.compile('{{first}}')(), '');
    });

    it('should return the first item in an array', function() {
      const fn = hbs.compile('{{first foo}}');
      assert.equal(fn({foo: ['a', 'b', 'c']}), 'a');
    });

    it('should return an array with the first two items in an array', function() {
      const fn = hbs.compile('{{first foo 2}}');
      assert.equal(fn({foo: ['a', 'b', 'c']}), 'a,b');
    });
  });

  describe('filter', function() {
    it('should return the array with filtered values', function() {
      const ctx = {array: ['a', 'b', 'c', 'd', 'e', 'c']};
      const template = hbs.compile('{{filter array "c"}}');
      assert.equal(template(ctx), ['c', 'c']);
    });

    it('should return the array with filtered values using a property name', function() {
      const ctx = {
        array: [
          {x: 'a', i: 0}, {x: 'b', i: 1}, {x: 'c', i: 2}, {x: 'd', i: 3}, {x: 'e', i: 4}, {x: 'c', i: 5}
        ]
      };
      const template = hbs.compile('{{JSONstringify (filter array "c" property="x")}}', {
        noEscape: true
      });
      assert.deepEqual(JSON.parse(template(ctx)), [{'x': 'c', 'i': 2}, {'x': 'c', 'i': 5}]);
    });
  });

  describe('forEach', function() {
    it('should iterate over an array, exposing objects as context', function() {
      const arr = [{name: 'a'}, {name: 'b'}, {name: 'c'}];

      const fn = hbs.compile('{{#forEach arr}}{{name}}{{/forEach}}');
      assert.equal(fn({arr: arr}), 'abc');
    });

    it('should expose `index`', function() {
      const arr = [{name: 'a'}, {name: 'b'}, {name: 'c'}];

      const fn = hbs.compile('{{#forEach arr}}{{index}}{{/forEach}}');
      assert.equal(fn({arr: arr}), '123');
    });

    it('should expose `total`', function() {
      const arr = [{name: 'a'}, {name: 'b'}, {name: 'c'}];

      const fn = hbs.compile('{{#forEach arr}}{{total}}{{/forEach}}');
      assert.equal(fn({arr: arr}), '333');
    });

    it('should expose `isFirst`', function() {
      const arr = [{name: 'a'}, {name: 'b'}, {name: 'c'}];

      const fn = hbs.compile('{{#forEach arr}}{{isFirst}}{{/forEach}}');
      assert.equal(fn({arr: arr}), 'truefalsefalse');
    });

    it('should expose `isLast`', function() {
      const arr = [{name: 'a'}, {name: 'b'}, {name: 'c'}];

      const fn = hbs.compile('{{#forEach arr}}{{isLast}}{{/forEach}}');
      assert.equal(fn({arr: arr}), 'falsefalsetrue');
    });
  });

  describe('hasLength', function() {
    it('should render the first block if length is the given number', function() {
      const fn = hbs.compile('{{#hasLength array 8}}AAA{{else}}BBB{{/hasLength}}');
      assert.equal(fn(context), 'AAA');
    });

    it('should render the inverse block if length is not the given number', function() {
      const fn = hbs.compile('{{#hasLength array 3}}AAA{{else}}BBB{{/hasLength}}');
      assert.equal(fn(context), 'BBB');
    });
  });

  describe('inArray', function() {
    it('should render the first block when a value exists in the array', function() {
      const fn = hbs.compile('{{#inArray array "d"}}AAA{{else}}BBB{{/inArray}}');
      assert.equal(fn(context), 'AAA');
    });

    it('should render the inverse block when a value does not exist', function() {
      const fn = hbs.compile('{{#inArray array "foo"}}AAA{{else}}BBB{{/inArray}}');
      assert.equal(fn(context), 'BBB');
    });
  });

  describe('isArray', function() {
    it('should return true if the value is an array', function() {
      assert.equal(hbs.compile('{{isArray "foo"}}')(), 'false');
      assert.equal(hbs.compile('{{isArray \'["foo"]\'}}')(), 'false');
      assert.equal(hbs.compile('{{isArray foo}}')({foo: ['foo']}), 'true');
      assert.equal(hbs.compile('{{isArray (toArray "foo")}}')(), 'true');
    });
  });

  describe('itemAt', function() {
    const ctx = {array: ['foo', 'bar', 'baz']};

    it('should return a null value for undefined array', function() {
      assert.equal(hbs.compile('{{#if (itemAt)}}exists{{else}}notfound{{/if}}')(), 'notfound');
    });

    it('should return a null value for empty array', function() {
      const fn = hbs.compile('{{#if (itemAt array)}}exists{{else}}notfound{{/if}}');
      assert.equal(fn({array: []}), 'notfound');
    });

    it('should return a null value for exceed bound', function() {
      const fn = hbs.compile('{{#if (itemAt array 999)}}exists{{else}}notfound{{/if}}');
      assert.equal(fn(ctx), 'notfound');
    });

    it('should return a first value of array for undefined index', function() {
      const fn = hbs.compile('{{itemAt array}}');
      assert.equal(fn(ctx), 'foo');
    });

    it('should return a first value of array for zero index', function() {
      const fn = hbs.compile('{{itemAt array 0}}');
      assert.equal(fn(ctx), 'foo');
    });

    it('should return a second value of array', function() {
      const fn = hbs.compile('{{itemAt array 1}}');
      assert.equal(fn(ctx), 'bar');
    });

    it('should return a last value of array', function() {
      const fn = hbs.compile('{{itemAt array -1}}');
      assert.equal(fn(ctx), 'baz');
    });

    it('should return a last before value of array', function() {
      const fn = hbs.compile('{{itemAt array -2}}');
      assert.equal(fn(ctx), 'bar');
    });
  });

  describe('join', function() {
    it('should return an empty string when undefined', function() {
      assert.equal(hbs.compile('{{join}}')(), '');
    });

    it('should join items by the default separator', function() {
      assert.equal(hbs.compile('{{join array}}')(context), 'a, b, c, d, e, f, g, h');
    });

    it('should join by a custom separator', function() {
      const fn = hbs.compile('{{join array " | "}}');
      assert.equal(fn(context), 'a | b | c | d | e | f | g | h');
    });
  });

  describe('last', function() {
    it('should return an empty string when undefined', function() {
      assert.equal(hbs.compile('{{last}}')(), '');
    });

    it('should return the last item in an array', function() {
      assert.equal(hbs.compile('{{last array}}')(context), 'h');
    });

    it('should return an array with the last two items in an array', function() {
      assert.equal(hbs.compile('{{last array 2}}')(context), 'g,h');
    });
  });

  describe('map', function() {
    it('should return an empty string when undefined', function() {
      assert.equal(hbs.compile('{{map}}')(), '');
    });

    it('should map the items in the array and return new values', function() {
      const locals = {array: ['a', 'b', 'c']};
      locals.double = function(str) {
        return str + str;
      };
      const fn = hbs.compile('{{map array double}}');
      assert.equal(fn(locals), 'aa,bb,cc');
    });

    it('should work with subexpressions:', function() {
      const locals = {};
      locals.double = function(str) {
        return str + str;
      };
      const fn = hbs.compile('{{map (split "a,b,c" ",") double}}');
      assert.equal(fn(locals), 'aa,bb,cc');
    });

    it('should return the value when not an array', function() {
      const fn = hbs.compile('{{map (split "b,c,a" ",") reverse}}');
      assert.equal(fn(context), 'b,c,a');
    });

    it('should return the value when no function is passed', function() {
      const fn = hbs.compile('{{map (split "b,c,a" ",")}}');
      assert.equal(fn(context), 'b,c,a');
    });
  });

  describe('pluck', function() {
    it('should get the given value from objects on an array', function() {
      const ctx = {array: [{a: 'x'}, {a: 'y'}, {a: 'z'}]};
      const fn = hbs.compile('{{pluck array "a"}}');
      assert.equal(fn(ctx), 'x,y,z');
    });
  });

  describe('reverse', function() {
    it('should return an empty string if the input is undefined', function() {
      const fn = hbs.compile('{{reverse x}}');
      assert.equal(fn({}), '');
    });

    it('should return an empty string if the input is a plain object', function() {
      const fn = hbs.compile('{{reverse x}}');
      assert.equal(fn({x: {}}), '');
    });

    it('should return an array in reverse', function() {
      const fn = hbs.compile('{{reverse x}}');
      assert.equal(fn({x: ['a', 'b', 'c', 'd']}), 'd,c,b,a');
    });

    it('should return a string in reverse', function() {
      const fn = hbs.compile('{{reverse "good morning"}}');
      assert.equal(fn(), 'gninrom doog');
    });
  });

  describe('some', function() {
    it('should render the first block if the callback returns true', function() {
      const ctx = {array: ['a', 'b', 'c']};
      ctx.isString = function(val) {
        return typeof val === 'string';
      };
      const fn = hbs.compile('{{#some array isString}}AAA{{else}}BBB{{/some}}');
      assert.equal(fn(ctx), 'AAA');
    });

    it('should render the inverse block if the array is undefined', function() {
      const fn = hbs.compile('{{#some array isString}}AAA{{else}}BBB{{/some}}');
      assert.equal(fn(), 'BBB');
    });

    it('should render the inverse block if falsey', function() {
      const ctx = {array: [['a'], ['b'], ['c']]};
      ctx.isString = function(val) {
        return typeof val === 'string';
      };
      const fn = hbs.compile('{{#some array isString}}AAA{{else}}BBB{{/some}}');
      assert.equal(fn(ctx), 'BBB');
    });
  });

  describe('sort', function() {
    it('should return an empty string when an invalid value is passed:', function() {
      const fn = hbs.compile('{{sort}}');
      const res = fn();
      assert.equal(res, '');
    });

    it('should sort the items in the array', function() {
      const fn = hbs.compile('{{sort array}}');
      const res = fn({array: ['c', 'a', 'b']});
      assert.equal(res, 'a,b,c');
    });

    it('should return all items in an array sorted in lexicographical order', function() {
      const fn = hbs.compile('{{sort array}}');
      assert.equal(fn(context), 'a,b,c,d,e,f,g,h');
    });

    it('should sort the items in the array in reverse order:', function() {
      const fn = hbs.compile('{{sort array reverse="true"}}');
      const res = fn({array: ['c', 'a', 'b']});
      assert.equal(res, 'c,b,a');
    });
  });

  describe('sortBy', function() {
    it('should return an empty string when undefined', function() {
      assert.equal(hbs.compile('{{sortBy}}')(), '');
    });

    it('should sort the items in an array when no props are provided', function() {
      const fn = hbs.compile('{{sortBy array}}');
      assert.equal(fn({array: ['b', 'c', 'a']}), 'a,b,c');
    });

    it('should return an empty array when the array is invalid', function() {
      const fn = hbs.compile('{{sortBy foo}}');
      assert.equal(fn({}), '');
    });

    it('should take a compare function', function() {
      const locals = {array: ['b', 'c', 'a']};
      locals.compare = (str) => {
        if (str === 'a') {
          return 2;
        }
        if (str === 'b') {
          return 3;
        }
        return 1;
      };
      const fn = hbs.compile('{{sortBy array compare}}');
      assert.equal(fn(locals), 'c,a,b');
    });

    it('should sort based on object key', function() {
      const ctx = {arr: [{a: 'zzz'}, {a: 'aaa'}]};
      const fn = hbs.compile('{{{JSONstringify (sortBy arr "a") 0}}}');
      assert.equal(fn(ctx), '[{"a":"aaa"},{"a":"zzz"}]');
    });

    it('should sort on multiple object keys', function() {
      const ctx = {
        arr: [{a: 'zzz', b: 'zzz', c: 1}, {a: 'zzz', b: 'aaa', c: 2}, {a: 'zzz', b: 'bbb', c: 3}]
      };
      const fn = hbs.compile('{{{JSONstringify (sortBy arr "a" "b")}}}');
      assert.equal(fn(ctx), '[{"a":"zzz","b":"aaa","c":2},{"a":"zzz","b":"bbb","c":3},{"a":"zzz","b":"zzz","c":1}]');
    });
  });

  describe('withAfter', function() {
    it('should use all of the items in an array after the specified count', function() {
      const fn = hbs.compile('{{#withAfter array 5}}<{{this}}>{{/withAfter}}');
      assert.equal(fn(context), '<f><g><h>');
    });
  });

  describe('withFirst', function() {
    it('should use the first item in an array', function() {
      const fn = hbs.compile('{{#withFirst array}}{{this}} is smart.{{/withFirst}}');
      assert.equal(fn(context), 'a is smart.');
    });
    it('should return an empty string when no array is passed:', function() {
      assert.equal(hbs.compile('{{#withFirst}}{{/withFirst}}')(), '');
    });
    it('should use the first two items in an array', function() {
      const fn = hbs.compile('{{#withFirst array 2}}{{this}} is smart.{{/withFirst}}');
      assert.equal(fn(context), 'a is smart.b is smart.');
    });
  });

  describe('withGroup', function() {
    it('should iterate over an array grouping elements by a given number', function() {
      const fn = hbs.compile('{{#withGroup collection 4}}{{#each this}}{{name}}{{/each}}<br>{{/withGroup}}');
      const res = fn({
        collection: [{name: 'a'}, {name: 'b'}, {name: 'c'}, {name: 'd'}, {name: 'e'}, {name: 'f'}, {name: 'g'}, {name: 'h'}]
      });
      assert.equal(res, 'abcd<br>efgh<br>');
    });
  });

  describe('withLast', function() {
    it('should return an empty string when undefined', function() {
      assert.equal(hbs.compile('{{withLast}}')(), '');
    });
    it('should use the last item in an array', function() {
      const fn = hbs.compile('{{#withLast array}}{{this}} is dumb.{{/withLast}}');
      assert.equal(fn(context), 'h is dumb.');
    });
    it('should use the last two items in an array', function() {
      const fn = hbs.compile('{{#withLast array 2}}{{this}} is dumb.{{/withLast}}');
      assert.equal(fn(context), 'g is dumb.h is dumb.');
    });
  });

  describe('withSort', function() {
    it('should return an empty string when array is undefined', function() {
      const fn = hbs.compile('{{#withSort}}{{this}}{{/withSort}}');
      assert.equal(fn(context), '');
    });

    it('should sort the array in lexicographical order', function() {
      const fn = hbs.compile('{{#withSort array}}{{this}}{{/withSort}}');
      assert.equal(fn(context), 'abcdefgh');
    });

    it('should sort the array in reverse order', function() {
      const fn = hbs.compile('{{#withSort array reverse="true"}}{{this}}{{/withSort}}');
      assert.equal(fn(context), 'hgfedcba');
    });

    it('should sort the array by deliveries', function() {
      const fn = hbs.compile('{{#withSort collection "deliveries"}}{{name}}: {{deliveries}} <br>{{/withSort}}');
      const res = fn({
        collection: [
          {name: 'f', deliveries: 8021},
          {name: 'b', deliveries: 239},
          {name: 'd', deliveries: -12}
        ]
      });
      assert.equal(res, 'd: -12 <br>b: 239 <br>f: 8021 <br>');
    });

    it('should sort the array by deliveries in reverse order', function() {
      const fn = hbs.compile('{{#withSort collection "deliveries" reverse="true"}}{{name}}: {{deliveries}} <br>{{/withSort}}');
      const res = fn({
        collection: [
          {name: 'f', deliveries: 8021},
          {name: 'b', deliveries: 239},
          {name: 'd', deliveries: -12}
        ]
      });
      assert.equal(res, 'f: 8021 <br>b: 239 <br>d: -12 <br>');
    });
  });

  describe('union', function() {
    it('should return the unique elements from both arrays', function() {
      const fn = hbs.compile('{{union array1 array2}}');
      const context = {
        array1: ['a', 'b', 'b', 'c', 'd', 'b', 'f', 'a', 'g'],
        array2: ['b', 'c', 'd', 'b', 'f', 'h', 'k', 'g']
      };
      assert.equal(fn(context).toString(), 'a,b,c,d,f,g,h,k');
    });

    it('should treat NaN values as equal', function() {
      const fn = hbs.compile('{{union array1 array2}}');
      const context = {
        array1: [1, NaN, 1, 2, 3, NaN],
        array2: [NaN, 4, NaN]
      };
      assert.equal(fn(context).toString(), '1,NaN,2,3,4');
    });
  });

  describe('unique', function() {
    it('should return an empty array when not given an array', function() {
      const fn = hbs.compile('{{JSONstringify (unique "hello")}}');
      assert.equal(fn({}), '[]');
    });

    it('should return array with unique items', function() {
      const fn = hbs.compile('{{unique array}}');
      const context = {
        array: ['a', 'b', 'b', 'c', 'd', 'b', 'f', 'a', 'g']
      };
      assert.equal(fn(context).toString(), 'a,b,c,d,f,g');
    });

    it('should treat NaN values as equal', function() {
      const fn = hbs.compile('{{unique array}}');
      const context = {
        array: [1, NaN, 1, 2, 3, NaN]
      };
      assert.equal(fn(context).toString(), '1,NaN,2,3');
    });
  });

  describe('uniqueBy', function() {
    it('should return an empty array when not given an array', function() {
      const fn = hbs.compile('{{JSONstringify (uniqueBy "hello" "a")}}');
      assert.equal(fn({}), '[]');
    });

    it('should return array with unique items', function() {
      const fn = hbs.compile('{{{JSONstringify (uniqueBy array "name")}}}');
      const context = {
        array: [
          {name: 'a', id: 1}, {name: 'a', id: 2}, {name: 'b', id: 3}, {name: 'c', id: 4}, {name: 'b', id: 5}]
      };
      assert.equal(fn(context).toString(), '[{"name":"a","id":1},{"name":"b","id":3},{"name":"c","id":4}]');
    });

    it('works with the example in docs', function() {
      const fn = hbs.compile('{{#each (uniqueBy array "a")}}{{a}}/{{id}},{{/each}}');
      const result = fn({
        array: [{a: 'zz', id: 1}, {a: 'aa', id: 2}, {a: 'zz', id: 3}]
      });
      assert.equal(result, 'zz/1,aa/2,');
    });

    it('should treat NaN values as equal', function() {
      const fn = hbs.compile('{{{JSONstringify (uniqueBy array "name")}}}');
      const context = {
        array: [{name: 1}, {name: NaN}, {name: 1}, {name: 2}, {name: 3}, {name: NaN}]
      };
      assert.equal(fn(context).toString(), '[{"name":1},{"name":null},{"name":2},{"name":3}]');
    });
  });
});
