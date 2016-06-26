'use strict';

function Logger(options) {
  this.options = options || {};

  this.headers = Object.assign({}, options.headers);
  this.headers['Content-Type'] = 'application/json; charset=utf8';
}


Logger.prototype.send = function () {};

module.exports = Logger;
