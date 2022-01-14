'use strict';

const assert = require('assert');
const hbs = require('handlebars').create();
const matchHelpers = require('../lib/match');

hbs.registerHelper(matchHelpers);

describe('match', function() {
  describe('isMatch', function() {
    it('should return true if the given value matches the glob', function() {
      assert.equal(hbs.compile('{{isMatch "foo.js" "*.js"}}')(), 'true');
      assert.equal(hbs.compile('{{isMatch "foo.js" "*.json"}}')(), 'false');
    });
  });
});
