'use strict';

var process = require('child_process');

function _command(command, callback) {
  process.exec(command, function(err, stdout, stderr) {
    if (stdout === '') {
      callback('this does not look like a git repo');
      return;
    }

    if (stderr) {
      callback(stderr);
      return;
    }

    callback(null, stdout.split('\n').join(','));
  });
}

var command =
  'git log -1 --pretty=format:"%h,%H,%s,%f,%b,%at,%ct,%an,%ae,%cn,%ce,%N,"' +
  ' && git rev-parse --abbrev-ref HEAD' +
  ' && git tag --contains HEAD';

module.exports = {
  getLastCommit : function(callback) {
    _command(command, function(err, res) {
      if (err) {
        callback(err);
        return;
      }

      var a = res.split(',');

      var tags = [];
      if (a[a.length-1] !== '') {
        tags = a.slice(13 - a.length);
      }

      callback(null, {
        shortHash: a[0],
        hash: a[1],
        subject: a[2],
        sanitizedSubject: a[3],
        body: a[4],
        authoredOn: a[5],
        committedOn: a[6],
        author: {
          name: a[7],
          email: a[8],
        },
        committer: {
          name: a[9],
          email: a[10]
        },
        notes: a[11],
        branch: a[12],
        tags: tags
      });
    });
  }
};
