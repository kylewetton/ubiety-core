/**
 * The main class for building a Ubiety instance
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 */

import _ from "lodash";
import { isElement } from "./utils/error";
import { defaults } from "./config";

/**
 * The main class for building a single customiser instance
 */

export default class Ubiety {
  /**
   * Ubiety constructor.
   *
   * @throws {Error} When the given root element or selector is invalid.
   *
   * @param {Element|string}  root       - A selector for a root element or an element itself.
   * @param {Object}          options    - Optional. Options to change default behaviour.
   */

  constructor(root, options = {}) {
    this.root = root instanceof Element ? root : document.querySelector(root);
    isElement(
      this.root,
      "Couldn't find the root element. Make sure it exists."
    );

    this.settings = _.defaultsDeep(options, defaults);
  }

  mount() {
    console.log(this.settings);
  }
}
