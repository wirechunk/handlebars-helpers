'use strict';

const assert = require('assert');
const engine = require('engine-handlebars');
const templates = require('templates');
let compile;
let render;
let app;

const allHelpers = {
  ...require('../../lib/array'),
  ...require('../../lib/code'),
  ...require('../../lib/collection'),
  ...require('../../lib/comparison'),
  ...require('../../lib/date'),
  ...require('../../lib/html'),
  ...require('../../lib/i18n'),
  ...require('../../lib/inflection'),
  ...require('../../lib/markdown'),
  ...require('../../lib/match'),
  ...require('../../lib/math'),
  ...require('../../lib/misc'),
  ...require('../../lib/number'),
  ...require('../../lib/object'),
  ...require('../../lib/path'),
  ...require('../../lib/regex'),
  ...require('../../lib/string'),
  ...require('../../lib/url')
};

describe('templates integration tests', function() {
  beforeEach(function() {
    app = templates();
    app.helpers(allHelpers);
    app.engine('hbs', engine);
    app.option('engine', 'hbs');
    app.context = function(val) {
      return val;
    };

    compile = function(content) {
      return app.compile(app.view({path: 'string', content: content}));
    };

    render = function(content, context) {
      return compile(content).fn(context);
    };
  });

  describe('dirname', function() {
    it('should get the dirname of a file path', function() {
      assert.equal(render('{{dirname "a/b/c/package.json"}}'), 'a/b/c');
      assert.equal(render('{{dirname "a/b/c/docs/toc.md"}}'), 'a/b/c/docs');
    });
  });

  describe('basename', function() {
    it('should get the basename of a file path', function() {
      assert.equal(render('{{basename "a/b/c/package.json"}}'), 'package.json');
      assert.equal(render('{{basename "a/b/c/docs/toc.md"}}'), 'toc.md');
    });
    it('should get the basename when a path has no extension', function() {
      const view = compile('{{basename "a/b/c/CHANGELOG"}}');
      assert.equal(view.fn(), 'CHANGELOG');
    });
  });

  describe('stem', function() {
    it('should get the stem of a file path', function() {
      assert.equal(render('{{stem "a/b/c/package.json"}}'), 'package');
      assert.equal(render('{{stem "a/b/c/docs/toc.md"}}'), 'toc');
    });
    it('should get the stem when a path has no extension', function() {
      const view = compile('{{stem "CHANGELOG"}}');
      assert.equal(view.fn(), 'CHANGELOG');
    });
  });

  describe('extname', function() {
    it('should get the extname of a file path', function() {
      assert.equal(render('{{extname "a/b/c/package.json"}}'), '.json');
      assert.equal(render('{{extname "a/b/c/docs/toc.md"}}'), '.md');
    });
    it('should not blow up when a path has no extension', function() {
      const view = compile('{{extname "a/b/c/CHANGELOG"}}');
      assert.equal(view.fn(), '');
    });
  });

  describe('segments', function() {
    it('should return specified path segments:', function() {
      assert.equal(render('{{segments "a/b/c/e.js" 1 3}}'), 'b/c');
      assert.equal(render('{{segments "a/b/c/e.js" 1 2}}'), 'b');
      assert.equal(render('{{segments "a/b/c/e.js" 0 3}}'), 'a/b/c');
      assert.equal(render('{{segments "a/b/c/e.js" 2 3}}'), 'c');
      assert.equal(render('{{segments "a/b/c/e.js" 0 3}}'), 'a/b/c');
    });
  });
});
