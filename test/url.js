'use strict';

require('mocha');
const assert = require('assert');
const hbs = require('handlebars').create();
const objectHelpers = require('../lib/object');
const urlHelpers = require('../lib/url');

hbs.registerHelper(objectHelpers);
hbs.registerHelper(urlHelpers);

describe('url', function() {
  describe('urlResolve', function() {
    it('should resolve a URL', function() {
      const fn1 = hbs.compile('{{urlResolve "http://example.com" "one"}}');
      assert.equal(fn1(), 'http://example.com/one');

      const fn2 = hbs.compile('{{urlResolve "http://example.com" "/one"}}');
      assert.equal(fn2(), 'http://example.com/one');

      const fn3 = hbs.compile('{{urlResolve "http://example.com/" "/one"}}');
      assert.equal(fn3(), 'http://example.com/one');

      const fn4 = hbs.compile('{{urlResolve "http://example.com/one" "/two"}}');
      assert.equal(fn4(), 'http://example.com/two');

      const fn5 = hbs.compile('{{urlResolve "http://example.com/one/" "two"}}');
      assert.equal(fn5(), 'http://example.com/one/two');

      const fn6 = hbs.compile('{{urlResolve "http://example.com/one/" "./two"}}');
      assert.equal(fn6(), 'http://example.com/one/two');

      const fn7 = hbs.compile('{{urlResolve "http://example.com/one" "./two"}}');
      assert.equal(fn7(), 'http://example.com/two');
    });
  });

  describe('decodeURIcomponent', function() {
    it('should return an decoded uri string.', function() {
      const fn = hbs.compile('{{{decodeURIComponent "http%3A%2F%2Fexample.com%3Fcomment%3DThyme%20%26time%3Dagain"}}}');
      assert.equal(fn(), 'http://example.com?comment=Thyme &time=again');
    });
  });

  describe('encodeURIComponent', function() {
    it('should return an encoded uri string.', function() {
      const fn = hbs.compile('{{encodeURIComponent "http://example.com?comment=Thyme &time=again"}}');
      assert.equal(fn(), 'http%3A%2F%2Fexample.com%3Fcomment%3DThyme%20%26time%3Dagain');
    });
  });

  describe('urlParse', function() {
    it('should take a string and return the URL (1)', function() {
      const fn = hbs.compile('{{{get "pathname" (urlParse "http://foo.com/bar/baz?key=value#hello")}}}');

      assert.deepEqual(fn(), '/bar/baz');
    });

    it('should take a string and return the URL (2)', function() {
      const fn = hbs.compile('{{{get "hash" (urlParse "http://foo.com/bar/baz?key=value#hello")}}}');

      assert.deepEqual(fn(), '#hello');
    });

    it('should take a string and return the URL, serialized by default as a URL', function() {
      const fn = hbs.compile('{{urlParse "http://foo.com/bar/baz?key=value#hello"}}', {noEscape: true});

      assert.deepEqual(fn(), 'http://foo.com/bar/baz?key=value#hello');
    });
  });

  describe('stripQuerystring', function() {
    it('should return a url without its query string.', function() {
      const fn = hbs.compile('{{stripQuerystring "http://example.com?tests=true"}}');
      assert.equal(fn(), 'http://example.com');
    });
  });
});
