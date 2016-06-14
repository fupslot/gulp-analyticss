'use strict';
const fs = require('fs');
const gutil = require('gulp-util');
const analyzer = require('analyze-css');
const Transform = require('stream').Transform;
const knox = require('knox');
const path = require('path');
const git = require('./lastcommit');

const config = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

module.exports = function (opts) {
	opts = opts || {};

	let headers = { 'x-amz-acl': 'public-read' };

  headers['Content-Type'] = 'application/json; charset=utf8';

  if (opts.headers) {
    for (let key in opts.headers) {
      headers[key] = opts.headers[key];
    }
  }

	var stream = new Transform({ objectMode: true });

	stream._transform = (file, encoding, cb) => {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError(config.name, 'Streaming not supported'));
			return;
		}

	  let nowMS = Date.now();
		let client = knox.createClient(opts.aws);

	  let extname = '.json';
	  let uploadPath = file.path.replace(path.extname(file.path), extname);
	  uploadPath = uploadPath.replace(file.base, opts.uploadPath || '');
	  uploadPath = uploadPath.replace(new RegExp('\\\\', 'g'), '/');
		uploadPath = uploadPath.replace(path.basename(uploadPath), nowMS + extname);

		try {
			git.getLastCommit((err, commit) => {

				if (err || typeof commit === 'string') {
					commit = null;
					let message = `Unable to collect a commit data, ${(err || commit)}`;
					gutil.log(gutil.colors.yellow(config.name + ' (warning)', message));
				}

				new analyzer(file.contents.toString(), opts, (err, results) => {
					if (err) {
						cb(new gutil.PluginError(config.name + ' (error)', err));
						return;
					}

					results.created = Date.now();
					results.commit = commit;

					let buffer = new Buffer(JSON.stringify(results), 'utf8');

					headers['Content-Length'] = buffer.length;

					client.putBuffer(buffer, uploadPath, headers, (err, res) => {
		        if (err || res.statusCode !== 200) {
		        	let message = `Upload path: ${uploadPath} code: ${res.statusCode} message: ${res.statusMessage}`;
		          gutil.log(gutil.colors.red(config.name+' (failed)', message));
		        } else {
		          gutil.log(gutil.colors.green(config.name+' (success)', `Uploaded ${uploadPath}`));
		          res.resume();

							cb(null, file);
		        }
		      });

				});
			});
		} catch (ex) {
			cb(new gutil.PluginError(config.name+' (error)', ex));
		}
	};

	return stream;
};
