/**
 * Rapid Review CLI Program Module.
 * @module rapidreview/cli/program.js
 */
const commander = require('commander');
const rapidreview = require('../rapidreview');
const rapidreviewPackage = require('../../package.json');

/**
 * @description Create and configure the program.
 * @public
 * @sync
 *
 * @param {object} options - Program options.
 * @return {Command} Commander command
 */
module.exports.make = (options) => {
  const program = new commander.Command();

  if (typeof options === 'object' && options.exitOverride) {
    program.exitOverride();
  }

  if (typeof options === 'object' && options.suppressOutput) {
    program.configureOutput({ writeOut: _silent, writeErr: _silent });
  }

  program
    .name('rapidreview')
    .description('A command-line interface (CLI) to support rapid review studies')
    .usage('[command] [options]')
    .version(rapidreviewPackage.version);

  program
    .command('prepare')
    .option('--i, --input <filepath>', 'filepath of the bib file')
    .option('--o, --output [filepath]', 'filepath of the bib file')
    .description('prepare the analysis fields')
    .action(rapidreview.prepare);

  program
    .command('sanitize')
    .option('--i, --input <filepath>', 'filepath of the bib file')
    .option('--o, --output [filepath]', 'filepath of the bib file')
    .option('--d, --directory <dirpath>', 'filepath of the working directory')
    .description('mark inconsistent and duplicate documents')
    .action(rapidreview.sanitize);

  program
    .command('snowballing')
    .option('--i, --input <filepath>', 'filepath of the bib file')
    .option('--s, --strategy <string>', 'snowballing strategy')
    .description('generate the Scopus URL')
    .action(rapidreview.snowballing);

  program
    .command('build')
    .option('--d, --directory <dirpath>', 'filepath of the working directory')
    .description('build release bib file')
    .action(rapidreview.build);

  return program;
};

/**
 * @description Construct the program to unit testing.
 * @private
 * @sync
 *
 * @param {array} args - Program arguments.
 * @param {object} options - Program options.
 * @return {any} Program result.
 */
// eslint-disable-next-line no-unused-vars
function _builder(args, options) {
  return exports.make(options).parse(args, { from: 'user' });
}

/**
 * @description Commander silent renderer.
 * @private
 * @sync
 */
function _silent() {
  return undefined;
}
