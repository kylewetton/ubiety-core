/**
 * The class for and managing overlying materials
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 * @class Material
 */

import _ from 'lodash';
import {
  v4 as uuidv4,
} from 'uuid';
import {
  MeshPhysicalMaterial,
  CubeTextureLoader,
  LoadingManager,
  TextureLoader,
  RepeatWrapping,
  DoubleSide,
  Vector2,
  FrontSide,
  sRGBEncoding,
} from 'three';
import {
  color as linearColor,
} from '../utils';
import {
  TEXTURE_PATH,
} from '../config';

const textureLoadManager = new LoadingManager();
const textureLoader = new TextureLoader(textureLoadManager);
const cubeTextureLoader = new CubeTextureLoader(textureLoadManager);

const getTexturePack = (pack) => {
  const {
    folder,
    tag,
    repeat,
    flip,
    url,
    ...maps
  } = pack;
  const path = `${TEXTURE_PATH}/${folder}/`;
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
      if (key === 'color' && url) {
        texture = textureLoader.load(url);
        texture.repeat.set(1, 1);
      } else {
        texture = textureLoader.load(`${path}${key}.jpg`);
        texture.repeat.set(scale, scale);
      }
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;

        texture.flipY = flip;

      if (key === 'color') {
        texture.encoding = sRGBEncoding;
      }

      texturePack[dict[key]] = texture;
    } else {
      texturePack[dict[key]] = null;
    }
  });

  return texturePack;
};

const defaults = {
  tag: 'default',
  type: 'standard',
  color: '#ffffff',
  opacity: 1.0,
  transparent: false,
  doubleSided: false,
  roughness: 1,
  metal: false,
  texture: {
    tag: '',
    alpha: false,
    ao: false,
    color: false,
    normal: false,
    roughness: false,
  },
  aoMapIntensity: 1,
  normalIntensity: 1,
  reflectivity: 0.5,
  envMapIntensity: 1,
  disableEnvMap: false,
};

class Material {
  constructor(settings = {}, tag, globalParent) {
    this.material = null;
    this.tag = tag;
    this.wireframe = false;
    this.uuid = uuidv4();
    this.settings = _.defaultsDeep({}, settings, defaults);
    this.cache = {};
    this.globalParent = globalParent;
    this._init();
  }

  apply() {
    return this.material;
  }

  _init() {
    if (this.globalParent) {
      const firedOnLoadEvent = this.globalParent.initialMaterialsLoaded;
      textureLoadManager.onLoad = () => {
        if (!firedOnLoadEvent) {
          document.dispatchEvent(new Event('Ubiety:onLoad'));
          this.globalParent.initialMaterialsLoaded = true;
        }

        this.globalParent._render();
      };
    }

    const r = `${TEXTURE_PATH}/cubemap/${this.globalParent.settings.studioType}/`;
    const urls = [
      `${r}px.png`,
      `${r}nx.png`,
      `${r}py.png`,
      `${r}ny.png`,
      `${r}pz.png`,
      `${r}nz.png`,
    ];
    this.textureCube = cubeTextureLoader.load(urls);

    const overrides = this._getOverrides();

    const settings = {
      ...this.settings,
      ...overrides,
    };

    const texturePack = getTexturePack(settings.texture);
    const shapedSettings = this._shapeSettings(settings, texturePack);

    this._buildMaterial({
      ...shapedSettings,
      ...texturePack,
    });
  }

  _shapeSettings(settings, texturePack) {
    const {
      type,
      tag,
      metal,
      specular,
      color,
      doubleSided,
      disableEnvMap,
      normalIntensity,
      ...shapedSettings
    } = settings;

    shapedSettings.color = linearColor(color);
    shapedSettings.metalness = metal ? 1.0 : 0;
    shapedSettings.side = doubleSided ? DoubleSide : FrontSide;
    shapedSettings.normalScale = new Vector2(normalIntensity, normalIntensity);
    shapedSettings.envMap = disableEnvMap ? null : this.textureCube;
    shapedSettings.transparent = _.has(texturePack, 'alphaMap') && true;

    return shapedSettings;
  }

  _buildMaterial(shapedSettings) {
    this.material = new MeshPhysicalMaterial(shapedSettings);
  }

  _getOverrides() {
    const persistentTexture = this.globalParent.settings.persistentTextures.filter(
      (override) => this.tag === override.tag,
    )[0];
    return persistentTexture || {};
  }

  swapColor(color, _updateMaterialCache = true) {
    if (_updateMaterialCache) {
      this.settings.color = color;
    }
    this.material.setValues({
      color: linearColor(color),
    });
  }

  swapTexture(payload) {
    const def = defaults.texture;
    const {
      texture: txt,
      ...rest
    } = payload;
    this.settings = _.defaultsDeep({}, payload, this.settings);
    const overrides = this._getOverrides();
    
    /**
     * A pack of loaded image Textures 
     * – alpha
     * – ao
     * – map 
     * – normal
     * – roughness
     */

    const texturePack = getTexturePack({
      ...def,
      ...txt,
      ...overrides.texture,
    });

    const shapedSettings = this._shapeSettings(rest, texturePack);
  
    this.material.setValues({
      ...texturePack,
      ...shapedSettings,
    });
    this.material.needsUpdate = true;
  }
}

export default Material;
