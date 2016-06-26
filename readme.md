# gulp-analyticss



## Install

```
$ npm install --save-dev gulp-analyticss
```

## Configuration file

Create `analyticss.json` file with following structure.

__NOTE:__ For security reasons we do not recommend to store this file in a git repository.

```json
{
  "aws": {
    "key": "<access_key>",
    "secret": "<secret>",
    "bucket": "<bucket_name>",
    "uploadPath": "<upload_path>"
  },

  "analyticss": {
    "key": "<access_key>",
    "secret": "<secret>",
    "applicationId": "<application_id> "
  }
}
```

## Usage


### Setup gulp task
Add a new task in your `gulpfile.js`

```js
const gulp = require('gulp');
const analyticss = require('gulp-analyticss');

let options = require('./analyticss.json');

gulp.task('analyticss', () => {
	gulp.src('dest/file.css')
		.pipe(analyticss(options));
);
```

__NOTE:__ Make sure your keep a gulp task name exactly the same as it appears on  the example.

## Post-commit hook




### How to install a `post-commit` hook

```bash
./node_modules/gulp-analyticss/hook install
```

### How to uninstall a `post-commit` hook

```bash
./node_modules/gulp-analyticss/hook uninstall
```

Use `--debug` option for more info.




## License

MIT © [Eugene Brodsky](https://github.com/fupslot)
