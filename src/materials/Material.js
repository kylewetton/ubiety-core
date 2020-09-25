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
    alpha: null,
    ao: null,
    color: null,
    normal: null,
    roughness: null,
  },
  aoMapIntensity: 1,
  normalIntensity: 1,
  reflectivity: 0.5,
  envMapIntensity: 1,
  disableEnvMap: false,
};

class Material {
  constructor(settings = {}, tag, globalParent, sectionParent) {
    this.material = new MeshPhysicalMaterial();
    this.tag = tag;
    this.wireframe = false;
    this.uuid = uuidv4();
    this.settings = _.defaultsDeep({}, settings, defaults);
    this.cache = {};
    this.globalParent = globalParent;
    this.sectionParent = sectionParent;
    this._init();
  }

  apply() {
    return this.material;
  }

  _getTexturePack (pack) {
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

        let resource = key === 'color' && url ? url : `${path}${key}.jpg`;
        let size = key === 'color' && url ? 1 : scale;

          textureLoader.load(resource, (texture) => {
            texture.repeat.set(size, size);
            
        
            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;
      
            texture.flipY = flip ? true : false;
      
            if (key === 'color') {
              texture.encoding = sRGBEncoding;
            }
            const vals = {};
            vals[dict[key]] = texture;
            this.material.setValues({...vals});
            this.material.needsUpdate = true;
          });
        
        } else {
          const falsies = {};
          falsies[dict[key]] = null;
          this.material.setValues({...falsies});
          this.material.needsUpdate = true;
        }
    });
    
  };

  _onTextureLoaded() {
   document.dispatchEvent(new Event('Ubiety:onLoad'));
   this.globalParent.initialMaterialsLoaded = true;
   const newMat = this.material.clone(); 
   this.sectionParent.setMaterialDirectly(newMat);

   this.sectionParent.mesh.material = this.material;
   this.globalParent._render();
   

  }

  _getBatchToLoad() {
    return this.batchToLoad;
  }

  _init() {
    if (this.globalParent) {
      const firedOnLoadEvent = this.globalParent.initialMaterialsLoaded;
      if (!firedOnLoadEvent) {
        textureLoadManager.onLoad = () => {this._onTextureLoaded()};
      }
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

    this._getTexturePack(settings.texture);
    const shapedSettings = this._shapeSettings(settings);

    this._buildMaterial({
      ...shapedSettings,
    });
  }

  _shapeSettings(settings) {
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
    shapedSettings.transparent = true;

    return shapedSettings;
  }

  _buildMaterial(shapedSettings) {
    const {texture, ...settings} = shapedSettings;
    this.material = new MeshPhysicalMaterial(settings);
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

    this._getTexturePack({
      ...def,
      ...txt,
      ...overrides.texture,
    });

    const shapedSettings = this._shapeSettings(rest);

    this.material.setValues({
      ...shapedSettings
    });
  }
}

export default Material;
