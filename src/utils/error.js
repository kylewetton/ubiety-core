/**
 * The main class for building the Customiser
 *
 * @author    Kyle Wetton
 * @copyright Livrée. All rights reserved.
 */

import { APP_NAME } from "../config";

const _ = require("lodash");

/**
 * Check existence of the given object and throw an error if it doesn't.
 *
 * @throws {Error}
 *
 * @param {*}      subject - A subject to be confirmed.
 * @param {string} message - An error message.
 */

export const exists = (subject, error) => {
  if (!subject) {
    throw new Error(`${APP_NAME}:: ${error}`);
  }
  return subject;
};

/**
 * Check if a subject is an instance of an Element
 *
 * @throws {Error}
 *
 * @param {*}      subject - A subject to be confirmed.
 * @param {string} message - An error message.
 */

export const isElement = (subject, error) => {
  const result = _.isElement(subject);
  return exists(result, error);
};
