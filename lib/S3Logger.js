'use strict';

const knox = require('knox');
const gutil = require('gulp-util');
const config = require('../package.json');
const S3UploadPath = require('./S3UploadPath');
const Logger = require('./logger');

let S3Logger = function (options) {
  Logger.apply(this, arguments);

  this.headers['x-amz-acl'] = 'public-read';

  this.client = knox.createClient(options.aws);
}

S3Logger.prototype.send = function (data, file, done) {
  let uploadPath = new S3UploadPath(file, this.options);

  let buffer = new Buffer(JSON.stringify(data), 'utf8');
  this.headers['Content-Length'] = buffer.length;

  this.client.putBuffer(buffer, uploadPath.path, this.headers, (err, res) => {
    if (err || res.statusCode !== 200) {
      let message = err ? err.message : res.statusMessage;
      let error = `${message}[${res.statusCode}] path: ${uploadPath.path}`;
      gutil.log(config.name, gutil.colors.red(error));

      if (res.statusCode === 403 || res.statusCode === 401) {
        gutil.log(config.name, gutil.colors.yellow('note: check your Amazon S3 credentials'));
      }

      done(error);
    } else {
      gutil.log(`${config.name}`, `created ${uploadPath.path}`);
      res.resume();
      done();
    }
  });
};


module.exports = function (options) {
  return new S3Logger(options);
};
