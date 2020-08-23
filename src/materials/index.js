import {
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  CubeTextureLoader,
  LoadingManager,
  TextureLoader,
  RepeatWrapping,
  TextureDataType,
} from "three";
import _ from "lodash";
import { color } from "../utils";
import { TEXTURE_PATH } from "../config";

const textureLoadManager = new LoadingManager();
const textureLoader = new TextureLoader(textureLoadManager);

const getTexturePack = (pack, tag) => {
  const { label, repeat, flip, ...maps } = pack;
  const path = `${TEXTURE_PATH}/${label}/`;
  const texturePack = {};
  const scale = repeat > 1 ? repeat : 1;
  /**
   * Dict renames the values to spread maps into material
   */
  const dict = {
    color: "map",
    ao: "aoMap",
    normal: "normalMap",
    roughness: "roughnessMap",
    alpha: "alphaMap",
  };

  _.forOwn(maps, function (value, key) {
    if (value) {
      const texture = textureLoader.load(`${path}${key}.jpg`);
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(scale, scale);
      if (flip) {
        texture.flipY = false;
      }

      texturePack[dict[key]] = texture;
    }
  });

  return texturePack;
};

const getNewMaterial = (options = {}, globalParent) => {
  const r = `${TEXTURE_PATH}/cubemap/`;
  const urls = [
    `${r}px.png`,
    `${r}nx.png`,
    `${r}py.png`,
    `${r}ny.png`,
    `${r}pz.png`,
    `${r}nz.png`,
  ];

  if (globalParent) {
    textureLoadManager.onLoad = () => globalParent._render();
  }

  const textureCube =
    options.type !== "metal"
      ? null
      : new CubeTextureLoader(textureLoadManager).load(urls);

  const textures =
    options.type !== "texture"
      ? null
      : getTexturePack(options.texture, options.tag);

  const defaults = {
    type: "phong",
    color: "#F1F1F1",
    texture: null,
    shininess: 0.2,
    roughness: 0,
    metalness: 1,
    envMap: textureCube,
    reflectivity: 3,
    envMapIntensity: 1.5,
  };

  const settings = _.defaultsDeep(options, defaults);

  const linearColor = color(settings.color);
  settings.color = linearColor;

  /**
   * Use spread to exclude the settings
   *
   * Using this method lets you dynamically add settings but force exclusion of others,
   *  this will safely filter out the settings and only use what it's allowed to use.
   *
   * https://dev.to/darksmile92/js-use-spread-to-exclude-properties-1km9
   */

  const {
    type: noPhongType,
    tag: noPhongTag,
    texture: noPhongTexture,
    metalness: noPhongMetalness,
    envMap: noPhongEnvMap,
    reflectivity: noPhongReflectivity,
    envMapIntensity: noEnvMapIntensity,
    roughness: noPhongRoughness,
    ...phongSettings // Use this variable
  } = settings;

  const {
    type: noMetalType,
    tag: noMetalTag,
    texture: noMetalTexture,
    shininess: noMetalShininess,
    ...metalSettings // Use this variable
  } = settings;

  const {
    type: noTextureType,
    tag: noTextureTag,
    metalness: noTextureMetalness,
    reflectivity: noReflectivity,
    envMap: noTextureEnvMap,
    roughness: noTextureRoughness,
    envMapIntensity: noTextureEnvMapIntensity,
    shininess: noTextureShininess,
    texture: noTextureTexture,
    ...textureSettings
  } = settings;

  let material;
  switch (settings.type) {
    case "phong":
      material = new MeshPhongMaterial({
        ...phongSettings,
      });
      break;
    case "metal":
      material = new MeshPhysicalMaterial({
        ...metalSettings,
      });
      break;
    case "texture":
      material = new MeshPhysicalMaterial({
        ...textureSettings,
        ...textures,
      });
      break;

    default:
      material = new MeshPhongMaterial({ color: settings.color });
  }
  material.transparent = true;
  return material;
};

export default getNewMaterial;
