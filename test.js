'use strict';

var assert = require('assert')

describe('absolutify', function() {
  var absolutify = require('./absolutify')

  // Non-changing string, should not get replaced
  var ok = ''
    + '<img src="www.foo.com" />'
    + '<img src="google.com" />'
    + '<img src="http://www.bar.com" />'
    + '<img src="//baz.com" />'
    + '<style>.shapes{background-image:url(//foo.com/assets/circle.svg);}</style>'
    + '<source srcset="//foo.com/logo/small.png 1x, //foo.com/logo/large.png 2x">'

  it('string replace', function() {
    assert.strictEqual(
      absolutify(
        '<a href="/relative">Heyo</a>' + ok
      , 'http://www.example.com'
      )
    , '<a href="http://www.example.com/relative">Heyo</a>' + ok
    )

    assert.strictEqual(
      absolutify(
        '<a href="../relative">Heyo</a>' + ok
      , 'http://www.example.com'
      )
    , '<a href="http://www.example.com/../relative">Heyo</a>' + ok
    )

    assert.strictEqual(
      absolutify(
        '<a href="/">Heyo</a>' + ok
      , 'http://www.example.com'
      )
    , '<a href="http://www.example.com/">Heyo</a>' + ok
    )
  })

  it('string replace single quote', function() {
    assert.strictEqual(
      absolutify(
        "<a href='../relative'>Heyo</a>" + ok
      , 'http://www.example.com'
      )
    , "<a href='http://www.example.com/../relative'>Heyo</a>" + ok
    )
  })

  it('string multi-replace', function() {
    assert.strictEqual(
      absolutify(
        '<a href="/relative">Heyo</a><form action="/index.php">' + ok
      , 'http://www.example.com'
      )
    , '<a href="http://www.example.com/relative">Heyo</a><form action="http://www.example.com/index.php">' + ok
    )
  })

  it('string replace anchor', function() {
    assert.strictEqual(
      absolutify(
        '<a href="#section">Section</a>' + ok
      , 'http://www.example.com'
      )
    , '<a href="http://www.example.com/#section">Section</a>' + ok
    )
  })
  
  it('string replace background', function() {
    let style = '<style>.shapes{background-image:url(/assets/circle.svg),url(/assets/square.svg);}</style>'
    assert.strictEqual(
      absolutify(
        style + ok, 
        'http://www.example.com'
      ),
      '<style>.shapes{background-image:url(http://www.example.com/assets/circle.svg),url(http://www.example.com/assets/square.svg);}</style>' + ok
    )
  })
  
  it('string replace srcset', function() {
    let source = '<source srcset="/logo/272x92dp.png 1x, //foo.com/logo/544x184dp.png 2x, /logo/816x276dp.png 3x">'
    assert.strictEqual(
      absolutify(
        source + ok, 
        'http://www.example.com'
      ),
      '<source srcset="http://www.example.com/logo/272x92dp.png 1x, //foo.com/logo/544x184dp.png 2x, http://www.example.com/logo/816x276dp.png 3x">' + ok
    )
  })

  it('function replace', function() {
    assert.strictEqual(
      absolutify(
        '<a href="/relative">Heyo</a>' + ok
      , function(url, attr) {
          return 'http://www.example.com' + url
        }
      )
    , '<a href="http://www.example.com/relative">Heyo</a>' + ok
    )

    assert.strictEqual(
      absolutify(
        '<a href="../two">Heyo</a>' + ok
      , function(url, attr) {
          return 'http://www.example.com/public/' + url
        }
      )
    , '<a href="http://www.example.com/public/../two">Heyo</a>' + ok
    )

    assert.strictEqual(
      absolutify(
        '<a href="./three">Heyo</a>' + ok
      , function(url, attr) {
          return 'http://www.example.com/' + url
        }
      )
    , '<a href="http://www.example.com/./three">Heyo</a>' + ok
    )
    
    assert.strictEqual(
      absolutify(
        '<img lowsrc="/x1/logo.png">' + ok,
        function(url, attr) {
          return 'http://www.example.com' + url
        }
      ),
      '<img lowsrc="http://www.example.com/x1/logo.png">' + ok
    )
  })

  it('function replace anchor', function() {
    assert.strictEqual(
      absolutify(
        '<a href="#section">Section</a>' + ok
      , function(url, attr) {
          return 'http://www.example.com' + url
        }
      )
    , '<a href="http://www.example.com#section">Section</a>' + ok
    )
  })

  it('function multi-replace', function() {
    assert.strictEqual(
      absolutify(
        '<a href="/relative">Heyo</a><form action="/index.php">' + ok
      , function(url, attr) {
          return 'http://www.example.com' + url
        }
      )
    , '<a href="http://www.example.com/relative">Heyo</a><form action="http://www.example.com/index.php">' + ok
    )
  })
})
