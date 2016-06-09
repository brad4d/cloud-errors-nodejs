var gatherConfiguration = require('./src/configurationExtraction/gatherConfiguration.js');
var AuthClient = require('./src/googleApis/AuthClient.js');
var errorClassParsingUtils = require('./src/errorClassParsingUtils.js');
// Begin error reporting interfaces
var hapi = require('./src/interfaces/hapi.js');
var manual = require('./src/interfaces/manual.js');
var express = require('./src/interfaces/express.js');

/**
 * @typedef ConfigurationOptions
 * @type Object
 * @property {String} [projectId] - the projectId of the project deployed
 * @property {String} [keyFilename] - path to a key file to use for an API key
 * @property {String} [key] - API key to use for communication with the service
 * @property {uncaughtHandlingEnum}
 *  [onUncaughtException=uncaughtHandlingEnum.ignore] - one of the uncaught
 *  handling options
 * @property {Object} [serviceContext] - the service context of the application
 * @property {String} [serviceContext.service] - the service the application is
 *  running on
 * @property {String} [serviceContext.version] - the version the hosting
 *  application is currently labelled as
 */

/**
 * @typedef ApplicationErrorReportingInterface
 * @type Object
 * @property {Object} hapi - The hapi plugin for StackDriver Error Reporting
 * @property {Function} report - The manual interface to report Errors to the
 *  StackDriver Error Reporting Service
 * @property {Function} express - The express plugin for StackDriver Error
 *  Reporting
 */

// Override the default stack trace preperation function
Error.prepareStackTrace = errorClassParsingUtils.prepareStackTraceError;

/**
 * The entry point for initializing the Error Reporting Middleware. This
 * function will invoke configuration gathering and attempt to create a API
 * client which will send errors to the Error Reporting Service. Invocation of
 * this function will also return an interface which can be used manually via
 * the `report` function property, with hapi via the `hapi` object property or
 * with express via the `express` function property.
 * @function initConfiguration
 * @param {ConfigurationOptions} initConfiguration - the desired project/error
 *  reporting configuration
 * @returns {ApplicationErrorReportingInterface} - The error reporting interface
 */
function initializeClientAndInterfaces ( initConfiguration ) {

  var config = gatherConfiguration(initConfiguration);
  var client = new AuthClient(
    initConfiguration.projectId
    , initConfiguration.shouldReportErrorsToAPI
  );

  return ({
    hapi: hapi(client, config)
    , report: manual(client, config)
    , express: express(client, config)
  });
}

module.exports = initializeClientAndInterfaces;
