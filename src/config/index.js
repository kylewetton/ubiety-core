import { color } from "../utils";

export const APP_NAME = "Ubiety";

/**
 * Default config for the Ubiety class
 */
export const defaults = {};

/**
 * Parameters for the 3D scene
 */
export const engineConfig = {
  sceneSettings: {
    background: color("#ff0000"),
  },
  cameraSettings: {
    fov: 50,
    near: 0.1,
    far: 500,
  },
  rendererSettings: {
    constructor: {
      antialias: true,
    },
    gammaFactor: 2.2,
  },
};
