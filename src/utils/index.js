/**
 * Ubiety Utilities
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 */

/* eslint-disable import/prefer-default-export */

import {
  Color, Box3, Vector3,
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

  const sortedArray = [...sortedItemsFiltered, ...nonSortedItemsFiltered];

  if (sortIndexProperty) {
    sortedArray.forEach((item, i) => {
      item.setIndex(i);
    });
  }

  return sortedArray;
};

/** Clean scale of model
 * @param {number} width Width in metres
 * @param {object} model loaded model
 * @return {object} A model with the width set to the the dimensions
 */

export const cleanScale = (width, model) => {
  const box = new Box3().setFromObject(model.children[0]);
  const size = new Vector3();
  box.getSize(size);
  const delta = model.scale.x;
  const scaleVec = new Vector3(
    width * delta,
    width * delta,
    width * delta,
  ).divide(size);
  const scale = Math.min(scaleVec.x, Math.min(scaleVec.y, scaleVec.z));

  model.scale.setScalar(scale);
  return model;
};

/** Moves the model to world origin
 * @param {object} model loaded model
 * @return {object} The model moved to the world origin
 */

const computeOriginOffset = ({ max, min }) => {
  const width = Math.abs(max.x - min.x);
  const height = Math.abs(max.y - min.y);
  const depth = Math.abs(max.z - min.z);

  const centerX = (max.x - width / 2) * -1;
  const centerY = (max.y - height) * -1;
  const centerZ = (max.z - depth / 2) * -1;

  return { x: centerX, y: centerY, z: centerZ };
};

export const cleanOrigin = (model) => {
  const boundingBox = new Box3();

  boundingBox.setFromObject(model.children[0]);
  const move = computeOriginOffset(boundingBox);

  model.children[0].translateX(move.x);
  model.children[0].translateY(move.y);
  model.children[0].translateZ(move.z);
  return model;
};
