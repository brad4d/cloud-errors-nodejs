/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
var Configuration = require('./lib/configuration.js');
var AuthClient = require('./lib/google-apis/auth-client.js');
// Begin error reporting interfaces
var koa = require('./lib/interfaces/koa.js');
var hapi = require('./lib/interfaces/hapi.js');
var manual = require('./lib/interfaces/manual.js');
var express = require('./lib/interfaces/express.js');
var restify = require('./lib/interfaces/restify');
var uncaughtException = require('./lib/interfaces/uncaught.js');
var createLogger = require('./lib/logger.js');

/** @record */
var ServiceContext = function(){};
/**
 * The service the application is running on.
 * @type {string}
 */
ServiceContext.prototype.service;
/**
 * The version the hosting application is currently labelled as.
 * @type {string}
 */
ServiceContext.prototype.version;

/** @record */
var ConfigurationOptions = function(){};
/**
 * The projectId of the project deployed.
 * @type {string}
 */
ConfigurationOptions.prototype.projectId;
/**
 * Path to a key file to use for an API key
 * @type {string}
 */
ConfigurationOptions.prototype.keyFileName;
/**
 * An integer between and including 0-5 or a decimal representation of an
 * integer including and between 0-5 in String form.
 * @type {string|number}
 */
ConfigurationOptions.prototype.logLevel;
/**
 * API key to use for communication with the service
 * @type {string}
 */
ConfigurationOptions.prototype.key;
/**
 * One of the uncaught handling options.
 * Default if undefined is {@code onUncaughtException=uncaughtHandlingEnum.ignore}
 * @type {uncaughtHandlingEnum}
 */
ConfigurationOptions.prototype.onUncaughtException;
/**
 * The service context of the application.
 * @type {!ServiceContext}
 */
ConfigurationOptions.prototype.serviceContext;

/*
 * @typedef ApplicationErrorReportingInterface
 * @type Object
 * @property {Object} hapi - The hapi plugin for Stackdriver Error Reporting
 * @property {Function} report - The manual interface to report Errors to the
 *  Stackdriver Error Reporting Service
 * @property {Function} express - The express plugin for Stackdriver Error
 *  Reporting
 */

/**
 * The entry point for initializing the Error Reporting Middleware. This
 * function will invoke configuration gathering and attempt to create a API
 * client which will send errors to the Error Reporting Service. Invocation of
 * this function will also return an interface which can be used manually via
 * the `report` function property, with hapi via the `hapi` object property or
 * with express via the `express` function property.
 * @param {ConfigurationOptions} initConfiguration - the desired project/error
 *  reporting configuration
 * @returns {ApplicationErrorReportingInterface} - The error reporting interface
 */
function initializeClientAndInterfaces (initConfiguration) {
  var logger = createLogger(initConfiguration);
  var config = new Configuration(initConfiguration, logger);
  var client = new AuthClient(config, logger);

  // Setup the uncaught exception handler
  uncaughtException(client, config);

  // Return the application interfaces for use by the hosting application
  return {
    koa: koa(client, config),
    hapi: hapi(client, config),
    report: manual(client, config),
    express: express(client, config),
    restify: restify(client, config)
  };
}

module.exports = {start: initializeClientAndInterfaces};
