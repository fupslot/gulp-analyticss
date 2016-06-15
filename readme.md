# gulp-analyticss



## Install

```
$ npm install --save-dev gulp-analyticss
```


## Usage

### Using Amazon S3

Create `aws.json` file with following structure. Here you have to specify your access keys to Amazon S3 service.

```jsons
{
  "key": "<access_key>",
  "secret": "<secret>",
  "bucket": "<bucket name>"
}
```

__NOTE:__ Do not forget to add `aws.json` to `.gitignore` file


### Setup gulp task
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

__NOTE:__ Make sure your keep a gulp task name exactly the same as it appears on  the example.

## Post-commit hook

Running `analyticss` task manually could be an inconvenient. A developer can simply forget to do this. Usually, we want this happening automatically, and there is an option for it. 

By default, your git repository provides a post-commit hook. That script gets executed each time a developer commit to a repository.


__NOTE:__ Before run install/uninstall script. Make sure you are in the root folder of your repository and `gulp-analyticss` package is installled.

### How to install a `post-commit` hook

```bash
./node_modules/gulp-analyticss/hook install
```

### How to uninstall a `post-commit` hook

```bash
./node_modules/gulp-analyticss/hook uninstall
```

Use `--debug` option for more info.


## API

#### options.uploadPath

Type: `string`<br>



## License

MIT © [Eugene Brodsky](https://github.com/fupslot)
