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
    background: color("#eeeeee"),
  },
  cameraSettings: {
    fov: 50,
    near: 0.1,
    far: 500,
    position: { x: 0, y: 0.5, z: 3 },
  },
  rendererSettings: {
    constructor: {
      antialias: true,
    },
    gammaFactor: 2.2,
  },
};
