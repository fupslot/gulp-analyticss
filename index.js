'use strict';

const fs = require('fs');
const gutil = require('gulp-util');
const analyzer = require('analyze-css');
const Transform = require('stream').Transform;
const git = require('./lib/lastcommit');

const config = require('./package.json');

module.exports = function (opts) {
  opts = opts || {};

  let logger;

  if (opts.analyticss) {
    logger = require('./lib/analyticssLogger')(opts);
    gutil.log(config.name, 'use analyticss.io');
  } else if (opts.aws) {
    logger = require('./lib/S3Logger')(opts);
    gutil.log(config.name, 'use Amazon S3');
  } else {
    gutil.log(config.name, gutil.colors.red(`wrong configuration file`));
    gutil.log(config.name, gutil.colors.red(`see ${config.homepage} for more details`));
    process.exit(1);
  }


  // TODO:
  // let stream = new Stream(logger);

  var stream = new Transform({ objectMode: true });

  stream._transform = (file, encoding, next) => {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError(config.name, 'Streaming not supported'));
      return;
    }

    try {
      git.getLastCommit((err, commit) => {

        if (err || typeof commit === 'string') {
          commit = null;
          let message = `Unable to collect a commit data, ${(err || commit)}`;
          gutil.log(config.name, gutil.colors.red(message));
        }

        new analyzer(file.contents.toString(), opts, (err, data) => {
          if (err) {
            cb(new gutil.PluginError(config.name + ' (error)', err));
            return;
          }

          data.created = Date.now();
          data.commit = commit;

          logger.send(data, file, (err) => {
            if (err) {
              gutil.log(config.name, gutil.colors.red(err.message));
            }

            next(null, file);
          });

        });
      });
    } catch (ex) {
      cb(new gutil.PluginError(config.name+' (error)', ex));
    }
  };

  return stream;
};
