'use strict';

const path = require('path');

module.exports = function S3UploadPath(file, options) {
  this.timestamp = Date.now();
  this.extname = '.json';
  this.file = file;

  let uploadPath = file.path.replace(path.extname(file.path), this.extname);
  uploadPath = uploadPath.replace(file.base, options.aws.uploadPath || '');
  uploadPath = uploadPath.replace(new RegExp('\\\\', 'g'), '/');
  uploadPath = uploadPath.replace(path.basename(uploadPath), this.timestamp + this.extname);

  this.path = uploadPath;
};
