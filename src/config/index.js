import {
  Math as ThreeMath,
  LinearToneMapping,
  NoToneMapping,
  ReinhardToneMapping,
  CineonToneMapping,
  ACESFilmicToneMapping,
} from "three";

// eslint-disable-next-line import/no-cycle
import { color } from "../utils";
// eslint-disable-next-line import/no-cycle
import getNewMaterial from "../materials";

export const APP_NAME = "Ubiety";
export const BRAND_COLOR = "#11864a";
export const TEXTURE_PATH = "./public/textures";

/**
 * Default config for the Ubiety class
 */
export const defaults = {
  initialMaterials: [],
  worldOffset: -0.33,
  order: [],
};

/**
 * Parameters for the 3D scene
 */
export const engineConfig = {
  sceneSettings: {
    background: color("#f1f1f1"),
  },
  cameraSettings: {
    fov: 40,
    near: 1,
    far: 300,
    position: { x: -3, y: 0.5, z: 3 },
  },
  rendererSettings: {
    constructor: {
      antialias: true,
    },
    gammaFactor: 2.2,
    toneMapping: LinearToneMapping,
  },
  controlSettings: {
    enableDampening: true,
    enableKeys: false,
    dampeningFactor: 0.2,
    rotateSpeed: 0.5,
    minPolarAngle: ThreeMath.degToRad(5),
    maxPolarAngle: ThreeMath.degToRad(85),
    minDistance: 2,
    maxDistance: 4,
  },
};

/**
 * Theme
 */

export const defaultTheme = {
  lights: [
    {
      id: "hemi",
      sky: 0xffffff,
      ground: 0xffffff,
      intensity: 1.75,
      position: { x: 0, y: 50, z: 0 },
    },
    {
      id: "directional",
      color: 0xffffff,
      intensity: 1,
      position: { x: -5, y: 16, z: 0 },
      shadows: false,
      mapSize: 4,
    },
    {
      id: "directional",
      color: 0xffffff,
      intensity: 1,
      position: { x: 5, y: 16, z: 0 },
      shadows: false,
      mapSize: 4,
    },
  ],
  floor: {
    color: "#333333",
    depth: 20,
    shadowOnly: true,
    shininess: 1,
    shadowOpacity: 0.2,
  },
};

const spotlightIntensity = 10;
const spotlightDistance = 10;
const spotlightHeightReduction = 2; // Higher value means less "AO"
const spotlightHeight = spotlightDistance - spotlightHeightReduction;

export const spotlightTheme = {
  lights: [
    {
      id: "hemi",
      sky: 0xffffff,
      ground: 0xffffff,
      intensity: 0.75,
      position: { x: 0, y: 50, z: 0 },
    },
    {
      id: "spot",
      color: 0xffffff,
      position: { x: 0, y: spotlightDistance + spotlightHeightReduction, z: 0 },
      intensity: spotlightIntensity,
    },
    {
      id: "spot",
      color: 0xffffff,
      position: { x: spotlightDistance, y: spotlightHeight, z: 0 },
      intensity: spotlightIntensity,
    },
    {
      id: "spot",
      color: 0xffffff,
      position: { x: spotlightDistance * -1, y: spotlightHeight, z: 0 },
      intensity: spotlightIntensity,
    },
    {
      id: "spot",
      color: 0xffffff,
      position: { x: 0, y: spotlightHeight, z: spotlightDistance },
      intensity: spotlightIntensity,
    },
    {
      id: "spot",
      color: 0xffffff,
      position: { x: 0, y: spotlightHeight, z: spotlightDistance * -1 },
      intensity: spotlightIntensity,
    },
  ],
  floor: {
    color: "#333333",
    depth: 20,
    shadowOnly: true,
    shininess: 1,
    shadowOpacity: 0.2,
  },
};

/**
 * Flash material
 */

export const flashSettings = {
  material: getNewMaterial({ color: BRAND_COLOR }),
  speed: 200,
};
