/**
 * The main class for building a Ubiety instance
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 * @class Section
 */

import _ from 'lodash';
import {
  tween,
} from 'shifty';
import {
  exists,
} from '../utils/error';

import Material from '../materials/Material';
import {
  flashSettings,
} from '../config';

class Section {
  /**
   * Section contructor
   *
   * @throws {Error} When the mesh doesn't exist.
   *
   * @param {Object}          mesh       - A mesh loaded from the gLTF file.
   * @param {Number}          index     - Index in sections array
   * @param {Object}          Class    - Parent Ubiety Class
   */
  constructor(mesh, index, globalParent) {
    this.mesh = exists(mesh, 'A Section class needs a mesh to construct.');
    this.tag = mesh.name;
    this.index = index;
    this.active = false;
    this.currentMaterial = null;
    this.previousMaterialAsSettings = {};
    this.materialAsSettings = {};
    this.globalParent = globalParent;
    this.children = [];
    this.disabled = mesh.disabled;
    this.isChild = false;
    this.activeChild = null;
  }

  updateMaterial(materialSettings) {
    const settings = _.has(materialSettings, 'material')
      ? materialSettings.material
      : materialSettings;

    this._storeAsPreviousMaterial();
    this.materialAsSettings = settings;

    const material = new Material(settings, this.tag, this.globalParent, this);

    this.currentMaterial = material;
    this.mesh.material = material.apply();

    this.children.forEach((child) => {
      child.updateMaterial(materialSettings);
    });
  }

  swapColor(hex, _updateMaterialCache = true) {
    this.currentMaterial.swapColor(hex, _updateMaterialCache);
    if (_updateMaterialCache) {
      this._storeAsPreviousMaterial();
      this.materialAsSettings.color = hex;
    }
    this.children.forEach((child) => child.swapColor(hex, _updateMaterialCache));
  }

  swapTexture(txt) {
    const newSettings = txt.dynamic ? _.defaultsDeep({}, txt, this.materialAsSettings) : txt;
    newSettings.color = this.materialAsSettings.color;
    this.currentMaterial.swapTexture(newSettings);
    this.children.forEach((child) => child.swapTexture(txt));
    this._storeAsPreviousMaterial();
    this.materialAsSettings = newSettings;
  }

  restorePreviousMaterial() {
    this.currentMaterial.swapTexture(this.previousMaterialAsSettings);
    this.children.forEach((child) => child.swapTexture(this.previousMaterialAsSettings));
    this.materialAsSettings = _.defaultsDeep({}, this.previousMaterialAsSettings);
  }

  flash() {
    const color = this.globalParent.settings.flashColor;
    const currentColor = this.materialAsSettings.color || '#FFFFFF';

    tween({
      from: {
        hex: currentColor,
      },
      to: {
        hex: color,
      },
      duration: flashSettings.speed / 2,
      step: (state) => {
        this.swapColor(state.hex, false);
        this.globalParent._render();
      },
    });
    tween({
      to: {
        hex: currentColor,
      },
      from: {
        hex: color,
      },
      duration: flashSettings.speed / 2,
      delay: flashSettings.speed / 2,
      step: (state) => {
        this.swapColor(state.hex, false);
        this.globalParent._render();
      },
    });
  }

  setActive(state) {
    this.active = state;
  }

  toggleActive() {
    this.active = !this.active;
  }

  isActive() {
    return this.active;
  }

  isDisabled() {
    return this.disabled;
  }

  isEnabled() {
    return !this.disabled;
  }

  setAbility(state) {
    this.disabled = state;
    this.globalParent._updateSectionIndexes();
  }

  setAsChild(parentTag) {
    this.isChild = true;
    this.parent = parentTag;
  }

  getTag() {
    return this.mesh.name;
  }

  setMaterialDirectly(material) {
    this.mesh.material = material;
    this.children.forEach((child) => child.setMaterialDirectly(material));
    this.globalParent._render();
  }

  getTagAsLabel() {
    const nameArray = this.mesh.name.split('_');
    const label = nameArray.join(' ');
    return _.startCase(label);
  }

  getCurrentMaterialName() {
    return this.currentMaterial.name;
  }

  getMaterialAsSettings() {
    return this.materialAsSettings;
  }

  getIndex() {
    return this.index;
  }

  setIndex(idx) {
    this.index = idx;
  }

  setPersistentTexture(texture) {
    this.persistentTexture = texture;
  }

  setVisibility(visible) {
    this.mesh.visible = visible;
  }

  _storeAsPreviousMaterial() {
    this.previousMaterialAsSettings = _.defaultsDeep({}, this.materialAsSettings);
  }
}

export default Section;
