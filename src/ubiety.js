/**
 * The main class for building a Ubiety instance
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 */

import _ from "lodash";
import { HemisphereLight, DirectionalLight } from "three";
import { isElement, exists } from "./utils/error";
import { defaults } from "./config";
import {
  getNewScene,
  getNewRenderer,
  getNewCamera,
  getNewLoadingManager,
  getGLTFLoader,
  getNewControls,
  theme,
} from "./engine";

import { getSize, color } from "./utils";
import getNewMaterial from "./materials";

/**
 * The main class for building a single customiser instance
 */

export default class Ubiety {
  /**
   * Ubiety constructor.
   *
   * @throws {Error} When the given root element or selector is invalid.
   *
   * @param {Element|string}  root       - A selector for a root element or an element itself.
   * @param {Object}          settings    - Optional. Options to change default behaviour.
   */

  constructor(root, modelPath, settings = {}) {
    /**
     * Constructor: Settings
     * */

    this.root = root instanceof Element ? root : document.querySelector(root);
    isElement(
      this.root,
      "Couldn't find the root element. Make sure it exists."
    );

    this.modelPath = exists(modelPath, "Please provide a path to the model.");

    this.settings = _.defaultsDeep(settings, defaults);

    /**
     * Constructor: Engine parts
     * */

    this.scene = getNewScene();
    this.renderer = getNewRenderer();
    this.camera = getNewCamera();
    this.modelManager = getNewLoadingManager();
    this.textureManager = getNewLoadingManager();
    this.gltfLoader = getGLTFLoader(this.modelManager);
    this.controls = getNewControls(this.camera, this.renderer.domElement);
    this._loop = this._loop.bind(this);

    /**
     * State
     * */

    this.model = null;
  }

  /**
   * Mounting phase
   * */

  mount() {
    this._createEvents();

    this.gltfLoader.load(this.modelPath, (gltf) => {
      const { scene: model } = gltf;

      model.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;

          const materialSettings = this.settings.initialMaterials.filter(
            (material) => material.tag === o.name
          );

          o.material = getNewMaterial(materialSettings[0]);
        }
      });

      model.position.y += this.settings.worldOffset;

      this.scene.add(model);
    });

    this.modelManager.onLoad = () => {
      this._buildEngine();
    };
  }

  _createEvents() {
    window.addEventListener("resize", () => {
      this._updateAspect();
    });

    this.controls.addEventListener("change", () => {
      this.renderer.render(this.scene, this.camera);
    });
  }

  _buildEngine() {
    const { lights, floor } = theme;

    lights.forEach((light) => this.scene.add(light));
    floor.position.y += this.settings.worldOffset;
    this.scene.add(floor);

    this.root.appendChild(this.renderer.domElement);
    this._updateAspect();
    this._loop();
  }

  /**
   * Runtime phase
   * */

  _updateAspect() {
    const { width, height } = getSize(this.root);
    this.camera.aspect = width / height;
    this.renderer.setSize(width, height);
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }

  _loop() {
    requestAnimationFrame(this._loop);
    this.controls.update();
  }
}
