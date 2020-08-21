/**
 * The main three.js engine objects
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 */

/* eslint-disable import/prefer-default-export */

import { Scene, PerspectiveCamera, WebGLRenderer } from "three";
import { engineConfig } from "../config";

const { background } = engineConfig.sceneSettings;
export const scene = new Scene();
scene.background = background;

const { fov, near, far } = engineConfig.cameraSettings;
export const camera = new PerspectiveCamera(fov, 500 / 500, near, far);

const { gammaFactor } = engineConfig.rendererSettings;
export const renderer = new WebGLRenderer({
  ...engineConfig.rendererSettings.constructor,
});
renderer.gammaFactor = gammaFactor;
