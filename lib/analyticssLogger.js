'use strict';

const gutil = require('gulp-util');
const request = require('request');
const Logger = require('./logger');
const config = require('../package.json');

const defaults = {
  origin: 'http://www.analyticss.io',
  path: '/api/records/css'
};

let AnalyticssIOLogger = function (options) {
  Logger.apply(this, arguments);

  this.config = Object.assign({}, defaults, options.analyticss);

  this.accessToken = '';
  this.accessTokenExpireMS = 0;
};

AnalyticssIOLogger.prototype.send = function (data, file, done) {
  this.sendData(data).then(done).catch(done);
};

AnalyticssIOLogger.prototype.sendData_ = function (data) {
  return (accessToken) => {
    let url = this.config.origin + this.config.path;
    let headers = {};

    headers['Authorization'] = `Bearer ${accessToken}`;
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'text/plain';

    let options = {
      url: url,
      json: true,
      qs: {
        "appid": this.config.applicationId
      },
      headers: headers,
      body: data
    };

    return new Promise((resolve, reject) => {
      // ResponseLog(callback())
      request.post(options, (err, res, body) => {
        if (err || res.statusCode !== 201) {
          let error = (err) ? err.message : res.statusMessage;
          let errorMessage = `${error}[${res.statusCode}]`;
          // gutil.log(config.name, gutil.colors.red(errorMessage));

          if (body && body.error) {
            gutil.log(config.name, gutil.colors.red(body.error));
          }

          if (body && body.validationError) {
            let keys = Object.keys(body.validationError);
            for (var i = keys.length - 1; i >= 0; i--) {
              gutil.log(config.name, gutil.colors.yellow(body.validationError[keys[i]][0]));
            }
          }

          return reject(new Error(errorMessage));
        }

        resolve();
      });
    });
  };
};

AnalyticssIOLogger.prototype.sendData = function (data) {
  return this.requestAccessToken().then(this.sendData_(data));
};

AnalyticssIOLogger.prototype.requestAccessToken = function () {
  let url = this.config.origin + '/oauth/token';
  let headers = {};

  let authorization = (new Buffer(`${this.config.key}:${this.config.secret}`)).toString('base64');

  headers['Authorization'] = `Basic ${authorization}`;
  headers['Content-Type'] = 'application/x-www-form-urlencoded';
  headers['Accept'] = 'application/json';

  let options = {
    url: url,
    headers: headers,
    json: true,
    form: {
      'grant_type':'client_credentials'
    }
  };

  return new Promise((resolve, reject) => {
    if (this.accessToken && Date.now() < this.accessTokenExpireMS) {
      resolve(this.accessToken);
    } else {
      request.post(options, (err, res, body) => {
        if (err || res.statusCode !== 200) {
          let error = (err) ? err.message : res.statusMessage;
          let errorMessage = `${error}[${res.statusCode}]`;
          gutil.log(config.name, gutil.colors.red(errorMessage));

          if (res.statusCode === 403 || res.statusCode === 401) {
            gutil.log(config.name, gutil.colors.yellow('note: check analyticss.io credentials'));
          }

          return reject(new Error(errorMessage));
        }

        this.accessToken = body.access_token;
        this.accessTokenExpireMS = new Date(Date.now() + (body.expires_in * 1000));

        resolve(this.accessToken);
      });
    }
  });
};

module.exports = function (options) {
  return new AnalyticssIOLogger(options);
};
