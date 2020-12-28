import {
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  CubeTextureLoader,
  LoadingManager,
  TextureLoader,
  RepeatWrapping,
  Color,
} from 'three';
import _ from 'lodash';
import { color } from '../utils';
import { TEXTURE_PATH } from '../config';

const textureLoadManager = new LoadingManager();
const textureLoader = new TextureLoader(textureLoadManager);

const getTexturePack = (pack) => {
  const {
    label, repeat, flip, url, ...maps
  } = pack;
  const path = `${TEXTURE_PATH}/${label}/`;
  const scale = repeat > 1 ? repeat : 1;
  const texturePack = {};

  /**
   * Dict renames the values to spread maps into material
   */
  const dict = {
    color: 'map',
    ao: 'aoMap',
    normal: 'normalMap',
    roughness: 'roughnessMap',
    alpha: 'alphaMap',
  };

  _.forOwn(maps, (value, key) => {
    if (value) {
      let texture;
      if (key === 'color' && this.globalParent.activeSection.customImage) {
        texture = textureLoader.load(this.globalParent.activeSection.customImage);
      }
      else if (key === 'color' && url && !this.globalParent.activeSection.customImage) {
        texture = textureLoader.load(url);
        texture.repeat.set(1, 1);
      } else {
        texture = textureLoader.load(`${path}${key}.jpg`);
        texture.repeat.set(scale, scale);
      }
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;

      if (flip) {
        texture.flipY = false;
      }

      texturePack[dict[key]] = texture;
    }
  });

  return texturePack;
};

const getNewMaterial = (options = {}, persistentTexture, globalParent) => {
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

  const textureCube = options.type !== 'metal'
    ? null
    : new CubeTextureLoader(textureLoadManager).load(urls);

  const defaults = {
    type: 'phong',
    color: '#F1F1F1',
    texture: null,
    shininess: 0.2,
    roughness: 0,
    metalness: 1,
    envMap: textureCube,
    reflectivity: 3,
    envMapIntensity: 1.5,
  };

  // hasOwnProperty hack
  const { tag: noPersistenceTag, ...persistence } = persistentTexture || {
    tag: '!',
  };

  const preSettings = _.defaultsDeep({}, options, defaults);
  const settings = _.defaultsDeep({}, persistence, preSettings);

  if (!(settings.color instanceof Color)) {
    const linearColor = color(settings.color);
    settings.color = linearColor;
  }

  const textures = settings.type !== 'texture'
    ? null
    : getTexturePack(settings.texture, settings.tag);

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
    case 'phong':
      material = new MeshPhongMaterial({
        ...phongSettings,
      });
      break;
    case 'metal':
      material = new MeshPhysicalMaterial({
        ...metalSettings,
      });
      break;
    case 'texture':
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
