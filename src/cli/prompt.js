/**
 * Rapid Review CLI Prompt Module.
 * @module rapidreview/cli/prompt.js
 */
const inquirer = require('inquirer');
const filesystemService = require('../service/filesystem-service');

/**
 * @description Set of inquirer questions.
 * @private
 */
const inquirerQuestions = [
  {
    name: 'input',
    type: 'input',
    message: 'Please, inform the input bib file (path):',
    validate: _isInputValid
  },
  {
    name: 'overwrite',
    type: 'confirm',
    message: 'Do you want to overwrite the input bib file?',
    default: 'Yes'
  },
  {
    name: 'output',
    type: 'input',
    message: 'Please, inform the output bib file (path):',
    when: _shouldPromptOutput,
    validate: _isOutputValid
  },
  {
    name: 'strategy',
    type: 'list',
    message: 'Choose the snowballing strategy:',
    choices: [
      { name: 'backward', value: 'backward' },
      { name: 'forward', value: 'forward' }
    ]
  },
  {
    name: 'directory',
    type: 'input',
    message: 'Please, inform the working directory (path):',
    validate: _isDirectoryValid
  }
];

/**
 * @description I/O prompt.
 * @public
 * @async
 *
 * @param {object} args - Arguments.
 * @return {Promise<object>} The command arguments.
 */
module.exports.io = async (args) => {
  args = _args(args);
  if (args.suppressOutput === true) return args;

  const questions = [];
  if ((await _isInputValid(args.input)) !== true) {
    questions.push(inquirerQuestions.find((item) => item.name === 'input'));
  }

  if ((await _isOutputValid(args.output)) !== true) {
    questions.push(inquirerQuestions.find((item) => item.name === 'overwrite'));
    questions.push(inquirerQuestions.find((item) => item.name === 'output'));
  }

  return inquirer.prompt(questions, args);
};

/**
 * @description Sanitize prompt.
 * @public
 * @async
 *
 * @param {object} args - Arguments.
 * @return {Promise<object>} The command arguments.
 */
module.exports.sanitize = async (args) => {
  args = _args(args);
  if (args.suppressOutput === true) return args;

  const questions = [];
  if ((await _isInputValid(args.input)) !== true) {
    questions.push(inquirerQuestions.find((item) => item.name === 'input'));
  }

  if ((await _isOutputValid(args.output)) !== true) {
    questions.push(inquirerQuestions.find((item) => item.name === 'overwrite'));
    questions.push(inquirerQuestions.find((item) => item.name === 'output'));
  }

  if ((await _isDirectoryValid(args.directory)) !== true) {
    questions.push(inquirerQuestions.find((item) => item.name === 'directory'));
  }

  return inquirer.prompt(questions, args);
};

/**
 * @description Snowballing prompt.
 * @public
 * @async
 *
 * @param {object} args - Arguments.
 * @return {Promise<object>} The command arguments.
 */
module.exports.snowballing = async (args) => {
  args = _args(args);
  if (args.suppressOutput === true) return args;

  const questions = [];
  if ((await _isInputValid(args.input)) !== true) {
    questions.push(inquirerQuestions.find((item) => item.name === 'input'));
  }

  if (!['backward', 'forward'].includes(args.strategy)) {
    questions.push(inquirerQuestions.find((item) => item.name === 'strategy'));
  }

  return inquirer.prompt(questions, args);
};

/**
 * @description Working directory prompt.
 * @public
 * @async
 *
 * @param {object} args - Arguments.
 * @return {Promise<object>} The command arguments.
 */
module.exports.directory = async (args) => {
  args = _args(args);
  if (args.suppressOutput === true) return args;

  const questions = [];
  if ((await _isDirectoryValid(args.directory)) !== true) {
    questions.push(inquirerQuestions.find((item) => item.name === 'directory'));
  }

  return inquirer.prompt(questions, args);
};

/**
 * @description Prepare arguments.
 * @private
 * @sync
 *
 * @param {object} args - Arguments.
 * @return {object} Arguments.
 */
function _args(args) {
  args.suppressOutput = typeof args === 'object' && args.suppressOutput === true;
  args.suppressWriting = typeof args === 'object' && args.suppressWriting === true;
  return args;
}

/**
 * @description Input validation.
 * @private
 * @async
 *
 * @param {string} path - System path.
 * @return {Promise<any>} Returns true (boolean) when valid and error message otherwise (string).
 */
async function _isInputValid(path) {
  return path && ((await filesystemService.fileExists(path)) ? true : 'Invalid file path');
}

/**
 * @description Output validation.
 * @private
 * @async
 *
 * @param {string} path - System path.
 * @return {Promise<any>} Returns true (boolean) when valid and error message otherwise (string).
 */
async function _isOutputValid(path) {
  return path && (!(await filesystemService.directoryExists(path)) ? true : 'Invalid file path');
}

/**
 * @description Directory validation.
 * @private
 * @async
 *
 * @param {string} path - Directory path.
 * @return {Promise<any>} Returns true (boolean) when valid and error message otherwise (string).
 */
async function _isDirectoryValid(path) {
  return path && ((await filesystemService.directoryExists(path)) ? true : 'Invalid directory path');
}

/**
 * @description Output prompt criteria.
 * @private
 * @sync
 *
 * @param {object} args - Arguments.
 * @return {boolean} Prompt flag.
 */
function _shouldPromptOutput(args) {
  return typeof args !== 'object' || args.overwrite !== true;
}
