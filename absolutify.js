;(function() {
'use strict';

/**
 * Replace all relative urls in a given HTML string with absolute
 *
 * @param str {String} html source
 * @param url {String} base url
 * @return {String} replaced html source
 */

function replace(str, url) {
  if (typeof url === 'function') return replace.iterate(str, url)
  return all(str, url)
}

/*!
 * The magic, find all occurences of `attr="/`, ignoring any `//` found,
 * ensure that the leading `/` of the url is not captured
 *
 * HTML attribute list from: http://stackoverflow.com/questions/2725156/complete-list-of-html-tag-attributes-which-have-a-url-value
 */

replace.rx = /((href|src|codebase|cite|background|action|profile|formaction|icon|manifest|archive)=["'])(([.]+\/)|(?:\/)|(?=#))(?!\/)/g

/*! Parse more valid url attributes (to avoid long line jshint problem) */
replace.extra = /((poster|longdesc|usemap)=["'])(([.]+\/)|(?:\/)|(?=#))(?!\/)/g

/*! Parse urls in styles */
replace.backgrounds = /((background|background-image):)(.*?)(;)/g
replace.urls = /(url\(["']?)(([.]+\/)|(?:\/)|(?=#))(?!\/)/g

/*! Parse urls in srcset */
replace.srcset = /(srcset=["'])(.*?)(["'])/g

/* Function to include all parsing expressions */
function all(str, url){
  let replaced = str.replace(replace.rx, '$1' + url + '/$4')
  replaced = replaced.replace(replace.extra, '$1' + url + '/$4')
  replaced = replaced.replace(replace.backgrounds, function(full, ...args){
    return args[0] + args[2].replace(replace.urls, '$1' + url + '/') + args[3]
  })
  return replaced.replace(replace.srcset, function(full, ...args){
    let sizes = args[1].split(',')
    let srcs = ''
    sizes.forEach(function(item, i){
      if (srcs)( srcs += ', ')
      srcs += item.trim().replace(/^(\/)(?!\/)/, url + '/')
    })
    return args[0] + srcs + args[2]
  })
}

/*!
 * Match the same as above, but capture the full URL for iteration
 */

replace.captureRx = /((href|src|codebase|cite|background|action|profile|formaction|icon|manifest|archive)=["'])((([.]+\/)|(?:\/)|(?:#))(?!\/)[a-zA-Z0-9._-]+)/g

/**
 * URL replacement using function iteration, this is handled slightly
 * different as the user will be supplied with the full attribute value
 * for replacement, and will be inserted back correctly
 *
 * @param {String} html source
 * @param {Function} url iterator, called with (url, attributeName)
 * @return {String} replaced html source
 */

replace.iterate = function(str, iterator) {
  return str.replace(replace.captureRx, function(full, prefix, prop, url) {
    return prefix + iterator(url, prop)
  })
}

/*!
 * Exports
 */

if (typeof exports !== 'undefined') module.exports = replace
else this.absolutify = replace

}.call(this));
