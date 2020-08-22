/**
 * The main class for building a Ubiety instance
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 */

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
   * @param {Object}          Class    - Parent Ubiety Class
   */
  constructor(mesh, globalParent) {
    this.mesh = exists(mesh, "A Section class needs a mesh to construct. ");
    this.tag = mesh.name;
    this.active = false;
    this.currentMaterial = null;
    this.flashMaterial = flashSettings.material;
    this.previousSettings = {};
    this.globalParent = globalParent;
  }

  updateMaterial(settings) {
    const material = getNewMaterial(settings, this.globalParent);
    this.currentMaterial = material;
    this.mesh.material = material;
  }

  flash(globalParent) {
    this.mesh.material = this.flashMaterial;
    globalParent._render();
    setTimeout(() => {
      this.mesh.material = this.currentMaterial;
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
    return this.mesh.disabled;
  }
}
