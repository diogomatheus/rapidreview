/**
 * Rapid Review CLI Bootstrap Module.
 * @module rapidreview/cli/bootstrap.js
 */
const program = require('./program');

/**
 * @description Starts the CLI application.
 * @public
 * @sync
 */
module.exports.execute = () => {
  try {
    program.make().parse(process.argv);
  } catch (error) {
    console.log(error instanceof Error ? `caught exception with message ${error.message}` : error);
    process.exitCode = 1;
  }
};
