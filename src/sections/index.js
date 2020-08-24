/**
 * The main class for building a Ubiety instance
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 */

import _ from "lodash";
import { exists } from "../utils/error";
import getNewMaterial from "../materials";
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
    this.flashMaterial = flashSettings.material;
    this.previousSettings = {};
    this.globalParent = globalParent;
    this.children = [];
    this.disabled = mesh.disabled;
    this.isChild = false;
    this.persistentTexture = {};
  }

  updateMaterial(settings) {
    const material = getNewMaterial(
      settings,
      this.persistentTexture,
      this.globalParent
    );
    this.currentMaterial = material;
    this.mesh.material = material;
    this.children.forEach((child) => {
      child.updateMaterial(settings);
    });
  }

  flash(globalParent) {
    this.mesh.material = this.flashMaterial;
    this.children.forEach((child) => {
      child.setMaterialDirectly(this.flashMaterial);
    });
    globalParent._render();
    setTimeout(() => {
      this.mesh.material = this.currentMaterial;
      this.children.forEach((child) => {
        child.setMaterialDirectly(child.currentMaterial);
      });
      globalParent._render();
    }, flashSettings.speed);
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

  getNameAsLabel() {
    const nameArray = this.mesh.name.split("_");
    const label = nameArray.join(" ");
    return _.startCase(label);
  }

  getCurrentMaterialName() {
    return this.currentMaterial.name;
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
