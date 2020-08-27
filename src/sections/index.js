/**
 * The main class for building a Ubiety instance
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 */

import _ from "lodash";
import { tween } from "shifty";
import { exists } from "../utils/error";

import Material from "../materials/Material";
import { flashSettings } from "../config";

export default class Section {
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
    this.mesh = exists(mesh, "A Section class needs a mesh to construct. ");
    this.tag = mesh.name;
    this.index = index;
    this.active = false;
    this.currentMaterial = null;
    this.currentMaterialId = null;
    this.flashMaterial = flashSettings.material;
    this.materialAsSettings = {};
    this.globalParent = globalParent;
    this.children = [];
    this.disabled = mesh.disabled;
    this.isChild = false;
    this.persistentTexture = {};
  }

  updateMaterial(materialSettings) {
    const settings = _.has(materialSettings, "material")
      ? materialSettings.material
      : materialSettings;

    this.materialAsSettings = settings;

    const material = new Material(settings, this.tag, this.globalParent);

    this.currentMaterial = material;
    this.mesh.material = material.apply();

    this.children.forEach((child) => {
      child.updateMaterial(materialSettings);
    });
  }

  swapColor(hex, _updateMaterialCache = true) {
    this.currentMaterial.swapColor(hex);
    if (_updateMaterialCache) {
      this.materialAsSettings.color = hex;
    }
    this.children.forEach((child) =>
      child.swapColor(hex, _updateMaterialCache)
    );
  }

  swapTexture(txt) {
    this.currentMaterial.swapTexture(txt);
    this.children.forEach((child) => child.swapTexture(txt));
  }

  flash() {
    const { color } = flashSettings;
    const currentColor = this.currentMaterial.settings.color;

    tween({
      from: { hex: currentColor },
      to: { hex: color },
      duration: flashSettings.speed / 2,
      step: (state) => {
        this.swapColor(state.hex, false);
        this.globalParent._render();
      },
    });
    tween({
      to: { hex: currentColor },
      from: { hex: color },
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
  }

  getTagAsLabel() {
    const nameArray = this.mesh.name.split("_");
    const label = nameArray.join(" ");
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
}
