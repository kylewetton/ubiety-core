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
  groups: [],
  persistentTextures: [],
};

/**
 * Parameters for the 3D scene
 */
export const engineConfig = {
  sceneSettings: {
    background: color("#f1f3f4"),
  },
  cameraSettings: {
    fov: 30,
    near: 1,
    far: 300,
    position: { x: -3, y: 0, z: 2 },
  },
  rendererSettings: {
    constructor: {
      antialias: true,
      preserveDrawingBuffer: true,
    },
    gammaFactor: 2.2,
    toneMapping: LinearToneMapping,
  },
  controlSettings: {
    enableDampening: true,
    enableKeys: false,
    dampeningFactor: 0.2,
    rotateSpeed: 0.5,
    minPolarAngle: ThreeMath.degToRad(0),
    maxPolarAngle: ThreeMath.degToRad(85),
    minDistance: 0,
    maxDistance: 40,
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
const spotlightHeightReduction = 1;
const spotlightHeight = spotlightDistance - spotlightHeightReduction;

export const spotlightTheme = {
  lights: [
    {
      id: "hemi",
      sky: 0xffffff,
      ground: 0xffffff,
      intensity: 0.66,
      position: { x: 0, y: 50, z: 0 },
    },
    {
      id: "spot",
      color: 0xffffff,
      position: { x: 0, y: spotlightDistance + spotlightHeightReduction, z: 0 },
      intensity: spotlightIntensity - spotlightIntensity / 3,
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
  color: BRAND_COLOR,
  speed: 200,
};

/**
 * Icons
 */

export const icons = {
  right: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
   <path d="M3.46 13.6788C3.5611 13.7313 3.67462 13.7554 3.78836 13.7484C3.90211 13.7413 4.01179 13.7034 4.10562 13.6388L12.2306 8.01375C12.3136 7.95623 12.3815 7.87945 12.4284 7.78998C12.4752 7.7005 12.4997 7.60101 12.4997 7.5C12.4997 7.399 12.4752 7.2995 12.4284 7.21003C12.3815 7.12056 12.3136 7.04377 12.2306 6.98625L4.10562 1.36125C4.01186 1.29637 3.90213 1.25838 3.78832 1.25139C3.67451 1.2444 3.56096 1.26867 3.45996 1.32159C3.35895 1.3745 3.27435 1.45404 3.21531 1.55159C3.15627 1.64914 3.12504 1.76098 3.125 1.875V13.125C3.12498 13.2391 3.15619 13.351 3.21524 13.4486C3.27429 13.5462 3.35894 13.6258 3.46 13.6788Z" fill="black"/>
   </svg>`,
  menu: `<svg width="28" height="21" viewBox="0 0 28 21" fill="none" xmlns="http://www.w3.org/2000/svg">
   <path d="M4.8125 6.23438H23.1875" stroke="black" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"/>
   <path d="M4.8125 10.5H23.1875" stroke="black" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"/>
   <path d="M4.8125 14.7656H23.1875" stroke="black" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round"/>
   </svg>`,
};
