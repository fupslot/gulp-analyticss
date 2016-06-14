#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');
const colors  = require('colors/safe');
const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, './package.json')));
const debug = true;

let repoDir = __dirname.substr(0, __dirname.indexOf('/node_modules'));
let hooksDir = path.resolve(repoDir, '.git', 'hooks');
let postCommitPath = __dirname + '/post-commit';
let postCommitHookPath = hooksDir + '/post-commit';

let program = require('commander');

program
  .version(config.version);

// Install
program
  .command('install')
  .option('-d, --debug, Shows some debug info', false)
  .description('Install the post-commit hook')
  .action(function(options) {

    if (options.debug) {
      console.log(colors.green(`repoDir: ${repoDir}`));
      console.log(colors.green(`hooksDir: ${hooksDir}`));
    }

    if (!fs.existsSync(hooksDir)) {
      console.log(colors.red(`${config.name}: ${hooksDir} not found`));
      process.exit(1);
    }

    if (fs.existsSync(postCommitHookPath)) {
      console.log(colors.yellow(`${config.name}: File ${postCommitHookPath} already exist`));
      console.log(colors.yellow(`${config.name}: You might want to complete this operation manually`));
      console.log(colors.red(`${config.name}: Aborted`));
      process.exit(1);
    }

    fs.copySync(postCommitPath, postCommitHookPath);

    // Leading zero.
    // http://stackoverflow.com/questions/20769023/using-nodejs-chmod-777-and-0777
    fs.chmodSync(postCommitHookPath, 0755);

    console.log(colors.green(`${config.name}: Install successfully. ${postCommitHookPath}`));
    process.exit(0);
  });

// Uninstall
program
  .command('uninstall')
  .option('-d, --debug, Shows some debug info', false)
  .description('Uninstall the post-commit hook')
  .action(function(options) {

    if (options.debug) {
      console.log(colors.green(`repoDir: ${repoDir}`));
      console.log(colors.green(`hooksDir: ${hooksDir}`));
    }

    // Hook not found,
    if (!fs.existsSync(postCommitHookPath)) {
      console.log(colors.yellow(`${config.name}: ${postCommitHookPath} not found`));
      process.exit(0);
    }

    fs.unlinkSync(postCommitHookPath);
    console.log(colors.green(`${config.name}: Uninstall successfully. ${postCommitHookPath}`));
    process.exit(0);

  });


program
  .parse(process.argv);
