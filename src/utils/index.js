/**
 * Ubiety Utilities
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 */

/* eslint-disable import/prefer-default-export */

import { Color } from "three";
import { isElement } from "./error";

/**
 * Converts a hex into a linear THREE color
 *
 * @param {hexidecimal|string}  hex  - The color to convert
 */

export const color = (hex) => {
  const linearColor = new Color(hex);
  linearColor.convertSRGBToLinear();
  return linearColor;
};

/**
 * Returns the current dimensions of the root element
 *
 * @param {Element}  element  - The root element
 */

export const getSize = (element) => {
  if (
    isElement(
      element,
      "Trying to get size of an element that doesn't exist. Make sure the root element is set correctly."
    )
  ) {
    const { width, height } = element.getBoundingClientRect();
    return { width, height };
  }
};
