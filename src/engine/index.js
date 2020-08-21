/**
 * The main three.js engine objects
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 */

/* eslint-disable import/prefer-default-export */

import { Scene, PerspectiveCamera, WebGLRenderer, LoadingManager } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { engineConfig } from "../config";

/**
 * SCENE
 */

const { background } = engineConfig.sceneSettings;
export const getNewScene = () => {
  const sceneInstance = new Scene();
  sceneInstance.background = background;
  return sceneInstance;
};

/**
 * CAMERA
 */

const {
  fov: fovDef,
  near: nearDef,
  far: farDef,
  position: cameraPosition,
} = engineConfig.cameraSettings;
export const getNewCamera = (fov = fovDef, near = nearDef, far = farDef) => {
  const { x, y, z } = cameraPosition;
  const cameraInstance = new PerspectiveCamera(fov, 500 / 500, near, far);
  cameraInstance.position.set(x, y, z);
  return cameraInstance;
};

/**
 * RENDERER
 */

const { gammaFactor } = engineConfig.rendererSettings;
export const getNewRenderer = () => {
  const rendererInstance = new WebGLRenderer({
    ...engineConfig.rendererSettings.constructor,
  });
  rendererInstance.gammaFactor = gammaFactor;
  return rendererInstance;
};

/**
 * LOADERS
 */

export const getGLTFLoader = (manager) => new GLTFLoader(manager);

/**
 * LOADING MANAGER
 */

export const getNewLoadingManager = () => {
  return new LoadingManager();
};

/**
 * CONTROLS
 */

export const getNewControls = (camera, renderer) => {
  return new OrbitControls(camera, renderer);
};
