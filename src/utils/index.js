/**
 * Ubiety Utilities
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 */

/* eslint-disable import/prefer-default-export */

import {
  Color,
} from 'three';
import {
  isElement,
} from './error';

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
      "Trying to get size of an element that doesn't exist. Make sure the root element is set correctly.",
    )
  ) {
    const {
      width,
      height,
    } = element.getBoundingClientRect();
    return {
      width,
      height,
    };
  }
};

/**
 * Takes an object and an array of keys in the order the object should be in, then sorts it
 *
 * @param {Object|Class} object     - The object to sort
 * @param {Array}  orderArray  - The custom order the keys should be in
 * @param {String}  key       - The object key to sort by
 * * @param {Boolean}  sortIndexProperty   - Use only if sorting Section Class
 */

export const sortObjectByArray = (
  object,
  orderArray,
  key,
  sortIndexProperty = false,
) => {
  const nonSortedItems = [];
  const sortedItems = [];

  object.forEach((item) => {
    const index = orderArray.indexOf(item[key]);
    if (index < 0) {
      nonSortedItems.push(item);
    } else {
      sortedItems[index] = item;
    }
  });

  const sortedItemsFiltered = sortedItems.filter((item) => item);
  const nonSortedItemsFiltered = nonSortedItems.filter((item) => item);

  console.log(sortedItemsFiltered);

  const sortedArray = [...sortedItemsFiltered, ...nonSortedItemsFiltered];

  if (sortIndexProperty) {
    sortedArray.forEach((item, i) => {
      item.setIndex(i);
    });
  }

  return sortedArray;
};
