/**
 * The main three.js engine objects
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 */

/* eslint-disable import/prefer-default-export */

import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  LoadingManager,
  GammaEncoding,
  Raycaster,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Theme from "./Theme";
import { engineConfig, defaultTheme, spotlightTheme } from "../config";

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

const { gammaFactor, toneMapping } = engineConfig.rendererSettings;
const pixelRatio = window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio;
export const getNewRenderer = () => {
  const rendererInstance = new WebGLRenderer({
    ...engineConfig.rendererSettings.constructor,
  });
  rendererInstance.gammaFactor = gammaFactor;
  rendererInstance.outputEncoding = GammaEncoding;
  rendererInstance.physicallyCorrectLights = true;
  rendererInstance.powerPreference = "high-performance";
  rendererInstance.setPixelRatio(pixelRatio);
  rendererInstance.toneMapping = toneMapping;
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
 * RAYCASTER
 */

export const getNewRaycaster = () => {
  return new Raycaster();
};

/**
 * CONTROLS
 */

const {
  enableDampening,
  enableKeys,
  dampeningFactor,
  rotateSpeed,
  maxPolarAngle,
  minPolarAngle,
  minDistance,
  maxDistance,
} = engineConfig.controlSettings;
export const getNewControls = (camera, renderer) => {
  const controlInstance = new OrbitControls(camera, renderer);

  controlInstance.enableDamping = enableDampening;
  controlInstance.enableKeys = enableKeys;
  controlInstance.dampingFactor = dampeningFactor;
  controlInstance.rotateSpeed = rotateSpeed;
  controlInstance.minPolarAngle = minPolarAngle;
  controlInstance.maxPolarAngle = maxPolarAngle;
  controlInstance.minDistance = minDistance;
  controlInstance.maxDistance = maxDistance;

  return controlInstance;
};

/**
 * THEME
 */

export const theme = new Theme(spotlightTheme);
