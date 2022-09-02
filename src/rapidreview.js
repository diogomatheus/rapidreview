/**
 * Rapid Review Module.
 * @module rapidreview/rapidreview.js
 */
const Listr = require('listr');
const listrSilentRenderer = require('listr-silent-renderer');
const prompt = require('./cli/prompt');
const coreService = require('./service/core-service');

/**
 * @description Prepare the bib file to be analyzed.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @return {Promise<string>} JabRef bib file contents.
 */
module.exports.prepare = async (args) => {
  args = await prompt.io(args);

  const tasks = [
    _task(args, 'Parsing the bib file', coreService.parseInputBib),
    _task(args, 'Adding analysis fields in documents', coreService.prepareAnalysisFields),
    _task(args, 'Building the bib file', coreService.buildDefaultBib),
    _task(args, 'Saving the bib file', coreService.save, args.suppressWriting),
    _task(args, 'Printing the output path', coreService.printOutputPath, args.suppressOutput)
  ];

  return _execute(args, tasks);
};

/**
 * @description Sanitize the bib file to agile the analysis.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @return {Promise<string>} JabRef bib file contents.
 */
module.exports.sanitize = async (args) => {
  args = await prompt.sanitize(args);

  const tasks = [
    _task(args, 'Parsing the bib file', coreService.parseInputBib),
    _task(args, 'Parsing the working directory bib files', coreService.parseDirectoryBibs),
    _task(args, 'Marking inconsistent documents', coreService.sanitizeInconsistent),
    _task(args, 'Marking duplicate documents', coreService.sanitizeDuplicate),
    _task(args, 'Building the bib file', coreService.buildDefaultBib),
    _task(args, 'Saving the bib file', coreService.save, args.suppressWriting),
    _task(args, 'Printing the output path', coreService.printOutputPath, args.suppressOutput)
  ];

  return _execute(args, tasks);
};

/**
 * @description Support snowballing building Scopus URL.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @return {Promise<string>} Scopus URL.
 */
module.exports.snowballing = async (args) => {
  args = await prompt.snowballing(args);

  const tasks = [
    _task(args, 'Parsing the bib file', coreService.parseInputBib),
    _task(args, 'Filtering the bib file documents', coreService.filterByInclusion),
    _task(args, 'Building the snowballing Scopus URL', coreService.buildSnowballingScopusURL),
    _task(args, 'Printing the Scopus URL', coreService.printScopusURL, args.suppressOutput)
  ];

  return _execute(args, tasks);
};

/**
 * @description Build release bib file.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @return {Promise<string>} JabRef bib file contents.
 */
module.exports.build = async (args) => {
  args = await prompt.directory(args);

  const tasks = [
    _task(args, 'Parsing the working directory bib files', coreService.parseDirectoryBibs),
    _task(args, 'Filtering the bib file documents', coreService.filterByInclusion),
    _task(args, 'Remove analysis fields in documents', coreService.removeAnalysisFields),
    _task(args, 'Building the bib file', coreService.buildReleaseBib),
    _task(args, 'Saving the bib file', coreService.release, args.suppressWriting),
    _task(args, 'Printing the output path', coreService.printOutputPath, args.suppressOutput)
  ];

  return _execute(args, tasks);
};

/**
 * @description Build Listr task.
 * @private
 * @sync
 *
 * @param {object} args - Workflow arguments.
 * @param {string} title - Task title.
 * @param {function} handler - Function handler.
 * @param {boolean} skip - Skip flag.
 * @return {object} Listr task.
 */
function _task(args, title, handler, skip = false) {
  return { title, task: async (context) => handler(args, context), skip: () => skip };
}

/**
 * @description Build and run the Listr workflow.
 * @private
 * @async
 *
 * @param {object} args - Arguments.
 * @param {array} tasks - Listr tasks.
 * @param {function} callback - Callback function.
 * @return {Promise<object>} Listr context.
 */
async function _execute(args, tasks) {
  const listrOptions = { renderer: _defineListrRenderer(args) };
  const listr = new Listr(tasks, listrOptions);
  const context = await listr.run();
  return context.response;
}

/**
 * @description Define the Listr renderer.
 * @private
 * @sync
 *
 * @param {object} args - Arguments.
 * @return {Promise<mixed>} Listr renderer.
 */
function _defineListrRenderer(args) {
  return args.suppressOutput === true ? listrSilentRenderer : 'default';
}
