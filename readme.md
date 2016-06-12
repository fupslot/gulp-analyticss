# gulp-analyticss



## Install

```
$ npm install --save-dev gulp-analyticss
```


## Usage

Setup your aws.json file
```jsons
{
  "key": "<access_key>",
  "secret": "<secret>",
  "bucket": "<bucket name>"
}
```

Add a new task in your `gulpfile.js`

```js
const gulp = require('gulp');
const analyticss = require('gulp-analyticss');

const options = {
	aws: JSON.parse(fs.readFileSync('./aws.json', 'utf8')),
	uploadPath: '/folder_name_within_a_bucket'
};

gulp.task('analyticss', () => {
	gulp.src('dest/file.css')
		.pipe(analyticss(options));
);
```


## API

#### options.uploadPath

Type: `string`<br>



## License

MIT © [Eugene Brodsky](https://github.com/fupslot)
