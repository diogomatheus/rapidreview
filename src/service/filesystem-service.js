/**
 * Rapid Review Service Filesystem Module.
 * @module rapidreview/service/filesystem-service.js
 */
const fs = require('fs');
const path = require('path');

/**
 * @description Build path based on fragments join.
 * @public
 * @async
 *
 * @param {array} args - Path fragments.
 * @return {Promise<string>} Path.
 */
module.exports.buildPath = async (...args) => path.join(...args);

/**
 * @description Analyze the file existence based on its path.
 * @public
 * @async
 *
 * @param {string} systempath - System path.
 * @return {Promise<boolean>} Flag representing the existence.
 */
module.exports.fileExists = async (systempath) => {
  try {
    const stats = await fs.promises.stat(systempath);
    return stats.isFile();
  } catch (error) {
    return false;
  }
};

/**
 * @description Read system file.
 * @public
 * @async
 *
 * @param {string} systempath - System path.
 * @return {Promise<object>} File information.
 */
module.exports.readFile = async (systempath) => _readFile(systempath);

/**
 * @description Read JabRef template file.
 * @public
 * @async
 *
 * @param {string} template - Template name (default|release).
 * @return {Promise<object>} File information.
 */
module.exports.readJabRefTemplateFile = async (template) => {
  if (!['default', 'release'].includes(template)) {
    return null;
  }

  const systempath = await exports.buildPath(__dirname, '..', 'assets', `${template}.bib`);
  return exports.readFile(systempath);
};

/**
 * @description Analyze the directory existence based on its path.
 * @public
 * @async
 *
 * @param {string} systempath - System path.
 * @return {Promise<boolean>} Flag representing the existence.
 */
module.exports.directoryExists = async (systempath) => {
  try {
    const stats = await fs.promises.stat(systempath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
};

/**
 * @description Read all directory bib files.
 * @public
 * @async
 *
 * @param {string} systempath - System path.
 * @return {Promise<array>} Array of object (file information).
 */
module.exports.readDirectoryBibFiles = async (systempath, exclude) => {
  const directoryItems = await _readDirectory(systempath);
  const bibFiles = directoryItems.filter(
    (item) => !item.isDirectory() && 
      (typeof exclude !== 'string' || path.basename(item.name) !== path.basename(exclude)) &&
      path.extname(item.name) === '.bib'
  );

  if (Array.isArray(bibFiles) && bibFiles.length) {
    const promises = bibFiles.map(async (file) => exports.readFile(await exports.buildPath(systempath, file.name)));
    return Promise.all(promises);
  }

  return [];

};

/**
 * @description Save the file contents on the path.
 * @public
 * @async
 *
 * @param {string} systempath - System path.
 * @param {string} contents - File contents.
 * @return {Promise<undefined>} None.
 */
module.exports.saveFile = async (systempath, contents) => fs.promises.writeFile(systempath, contents);

/**
 * @description Read system file.
 * @private
 * @async
 *
 * @param {string} systempath - System path.
 * @return {Promise<object>} File information.
 */
async function _readFile(systempath) {
  const contents = await fs.promises.readFile(systempath, 'utf-8');
  return { systempath, name: path.basename(systempath), contents };
};

/**
 * @description Read all directory files and subdirectories.
 * @private
 * @async
 *
 * @param {string} systempath - System path.
 * @return {Promise<array>} Array of files or subdirectories.
 */
async function _readDirectory(systempath) {
  return fs.promises.readdir(systempath, { withFileTypes: true })
}
