/**
 * Rapid Review Service Core Module.
 * @module rapidreview/service/core-service.js
 */
const filesystemService = require('./filesystem-service');
const bibtexService = require('./bibtex-service');

/**
 * @description Parse bib file to object.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @param {object} context - Listr context.
 * @return {Promise<object>} Listr context.
 */
module.exports.parseInputBib = async (args, context) => {
  if (args.input) {
    const file = await filesystemService.readFile(args.input);
    const bibFile = await _parseBibFile(file, 'input');
    context.bibs = Array.isArray(context.bibs) ? [...context.bibs, bibFile] : [bibFile];
  }
  return context;
};

/**
 * @description Parse directory bib files to objects, ignoring input bib if found.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @param {object} context - Listr context.
 * @return {Promise<object>} Listr context.
 */
module.exports.parseDirectoryBibs = async (args, context) => {
  if (args.directory) {
    const files = await filesystemService.readDirectoryBibFiles(args.directory, args.input);
    const bibFiles = await _parseBibFiles(files, 'directory');
    context.bibs = Array.isArray(context.bibs) ? [...context.bibs, ...bibFiles] : bibFiles;
  }
  return context;
};

/**
 * @description Prepare analysis fields in objects' documents.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @param {object} context - Listr context.
 * @return {Promise<object>} Listr context.
 */
module.exports.prepareAnalysisFields = async (args, context) => {
  if (Array.isArray(context.bibs) && context.bibs.length) {
    const promises = context.bibs.map(async (bib) => {
      bib.documents = await bibtexService.prepareAnalysisFields(bib.documents);
      return bib;
    });
    context.bibs = await Promise.all(promises);
  }
  return context;
};

/**
 * @description Remove analysis fields of objects' documents.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @param {object} context - Listr context.
 * @return {Promise<object>} Listr context.
 */
module.exports.removeAnalysisFields = async (args, context) => {
  if (Array.isArray(context.bibs) && context.bibs.length) {
    const promises = context.bibs.map(async (bib) => {
      bib.documents = await bibtexService.removeAnalysisFields(bib.documents);
      return bib;
    });
    context.bibs = await Promise.all(promises);
  }
  return context;
};

/**
 * @description Mark inconsistent input object's documents.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @param {object} context - Listr context.
 * @return {Promise<object>} Listr context.
 */
module.exports.sanitizeInconsistent = async (args, context) => {
  if (Array.isArray(context.bibs) && context.bibs.length) {
    const input = context.bibs.find((item) => item.source === 'input');
    if (typeof input === 'object') {
      const existingBibs = context.bibs.filter((item) => item.source !== 'input');
      input.documents = await bibtexService.sanitizeInconsistent(input.documents);
      context.bibs = [input, ...existingBibs];
    }
  }
  return context;
};

/**
 * @description Mark duplicate input object's documents.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @param {object} context - Listr context.
 * @return {Promise<object>} Listr context.
 */
module.exports.sanitizeDuplicate = async (args, context) => {
  if (Array.isArray(context.bibs) && context.bibs.length) {
    const input = context.bibs.find((item) => item.source === 'input');
    if (typeof input === 'object') {
      const existingBibs = context.bibs.filter((item) => item.source !== 'input');
      input.documents = await bibtexService.sanitizeDuplicate(input.name, input.documents, existingBibs);
      context.bibs = [input, ...existingBibs];
    }
  }
  return context;
};

/**
 * @description Filter bib file(s) documents by inclusion.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @param {object} context - Listr context.
 * @return {Promise<object>} Listr context.
 */
module.exports.filterByInclusion = async (args, context) => {
  if (Array.isArray(context.bibs) && context.bibs.length) {
    const promises = context.bibs.map(async (bib) => {
      bib.documents = await bibtexService.filterByFieldValue(bib.documents, 'reading_criteria', 'YES');
      return bib;
    });
    context.bibs = await Promise.all(promises);
  }
  return context;
};

/**
 * @description Build the snowballing Scopus URL.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @param {object} context - Listr context.
 * @return {Promise<object>} Listr context.
 */
module.exports.buildSnowballingScopusURL = async (args, context) => {
  if (Array.isArray(context.bibs) && context.bibs.length) {
    const input = context.bibs.find((item) => item.source === 'input');
    if (typeof input === 'object') {
      context.response = await bibtexService.buildSnowballingScopusURL(args.strategy, input.documents);
    }
  }
  return context;
};

/**
 * @description Build default bib file contents.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @param {object} context - Listr context.
 * @return {Promise<object>} Listr context.
 */
module.exports.buildDefaultBib = async (args, context) => {
  const input = context.bibs.find((item) => item.source === 'input');
  if (typeof input === 'object') {
    const bibtexContents = await bibtexService.object2bibtex(input.documents);
    const jabRefTemplate = await filesystemService.readJabRefTemplateFile('default');
    context.response = jabRefTemplate.contents.replace('BODY', bibtexContents);
  }
  return context;
};

/**
 * @description Build release bib file contents.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @param {object} context - Listr context.
 * @return {Promise<object>} Listr context.
 */
module.exports.buildReleaseBib = async (args, context) => {
  const documents = context.bibs.reduce((array, bib) => array.concat(bib.documents), []);
  const bibtexContents = await bibtexService.object2bibtex(documents);
  const jabRefTemplate = await filesystemService.readJabRefTemplateFile('release');
  context.response = jabRefTemplate.contents.replace('BODY', bibtexContents);
  return context;
};

/**
 * @description Save default bib file.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @param {object} context - Listr context.
 * @return {Promise<object>} Listr context.
 */
module.exports.save = async (args, context) => {
  context.output = args.overwrite === true ? args.input : args.output;
  await filesystemService.saveFile(context.output, context.response);
  return context;
};

/**
 * @description Save release bib file.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @param {object} context - Listr context.
 * @return {Promise<object>} Listr context.
 */
module.exports.release = async (args, context) => {
  context.output = await filesystemService.buildPath(args.directory, 'release-dataset.bib');
  await filesystemService.saveFile(context.output, context.response);
  return context;
};

/**
 * @description Print the output path.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @param {object} context - Listr context.
 * @return {Promise<object>} Listr context.
 */
module.exports.printOutputPath = async (args, context) => {
  if (typeof context === 'object' && context.output) {
    console.log(`\nOutput path: ${context.output}\n`);
  }
};

/**
 * @description Print the Scopus URL.
 * @public
 * @async
 *
 * @param {object} args - Workflow arguments.
 * @param {object} context - Listr context.
 * @return {Promise<object>} Listr context.
 */
module.exports.printScopusURL = async (args, context) => {
  if (typeof context === 'object' && context.response) {
    console.log(`\nScopus URL: ${context.response}\n`);
  }
};

/**
 * @description Parse bib file.
 * @public
 * @async
 *
 * @param {object} file - File information.
 * @param {string} source - File source (input|directory).
 * @return {Promise<object>} Bib file information.
 */
async function _parseBibFile(file, source = 'input') {
  if (!file) {
    return null;
  }

  const documents = await bibtexService.bibtex2object(file.contents);
  return { source, systempath: file.systempath, name: file.name, documents };
};

/**
 * @description Parse bib files.
 * @public
 * @async
 *
 * @param {array} files - Array of object (i.e., file information).
 * @param {string} source - File source (input|directory).
 * @return {Promise<array>} Bib files information.
 */
async function _parseBibFiles(files, source = 'directory') {
  if (!Array.isArray(files) || !files.length) {
    return [];
  }

  return Promise.all(files.map(async (file) => _parseBibFile(file, source)));
};
