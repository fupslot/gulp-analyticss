'use strict';
const gutil = require('gulp-util');
const analyzer = require('analyze-css');
const Transform = require('stream').Transform;
const knox = require('knox');
const path = require('path');
const git = require('git-last-commit');

module.exports = function (opts) {
	opts = opts || {};
	opts.aws = opts.aws || {};

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
			cb(new gutil.PluginError('gulp-analycss', 'Streaming not supported'));
			return;
		}

		let client = knox.createClient(opts.aws);
	  let uploadPath = file.path.replace(path.extname(file.path), '.json');
	  uploadPath = uploadPath.replace(file.base, opts.uploadPath || '');
	  uploadPath = uploadPath.replace(new RegExp('\\\\', 'g'), '/');

		try {
			git.getLastCommit((err, commit) => {
				let fileName;

				if (err || typeof commit === 'string') {
					fileName = Date.now();
				} else {
					fileName = commit.shortHash;
				}

				uploadPath = uploadPath.replace(path.basename(uploadPath), fileName + path.extname(uploadPath));

				new analyzer(file.contents.toString(), opts, (err, results) => {
					if (err) {
						cb(new gutil.PluginError('gulp-analyticss', err));
						return;
					}

					results.created = Date.now();
					results.commit = commit;

					let buffer = new Buffer(JSON.stringify(results), 'utf8');

					headers['Content-Length'] = buffer.length;

					client.putBuffer(buffer, uploadPath, headers, (err, res) => {
		        if (err || res.statusCode !== 200) {
		          gutil.log(gutil.colors.red('[FAILED]', file.path + " -> " + uploadPath));
		        } else {
		          gutil.log(gutil.colors.green('[SUCCESS]', file.path + " -> " + uploadPath));
		          res.resume();

							cb(null, file);
		        }
		      });

				});
			});
		} catch (ex) {
			cb(new gutil.PluginError('gulp-csso', ex));
		}
	};

	return stream;
};
