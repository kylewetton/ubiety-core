/**
 * The main class for building a Ubiety instance
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 */

import _ from "lodash";
import { isElement, exists } from "./utils/error";
import { defaults } from "./config";
import {
  getNewScene,
  getNewRenderer,
  getNewCamera,
  getNewLoadingManager,
  getGLTFLoader,
  getNewControls,
  getNewRaycaster,
  theme,
} from "./engine";

import { getSize, color } from "./utils";
import Section from "./sections";

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
   * @param {Object}          settings   - Optional. Options to change default behaviour.
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
    this.raycaster = getNewRaycaster();
    this._loop = this._loop.bind(this);

    /**
     * State
     * */

    this.model = null;
    this.sections = [];
    this.mouse = { x: 0, y: 0 };
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

          const section = new Section(o);
          section.updateMaterial(materialSettings[0]);

          if (o.name === "base") {
            section.setActive(true);
          }

          this.sections.push(section);
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

    window.addEventListener(
      "mousemove",
      (evt) => this._updateMousePosition(evt),
      false
    );

    this.renderer.domElement.addEventListener(
      "mousedown",
      () => {
        this.mouseDownPosition = { ...this.mouse };
      },
      false
    );

    this.renderer.domElement.addEventListener(
      "mouseup",
      () => {
        const looseMouse = {
          x: _.round(this.mouse.x, 2),
          y: _.round(this.mouse.y, 2),
        };
        const looseDownMouse = {
          x: _.round(this.mouseDownPosition.x, 2),
          y: _.round(this.mouseDownPosition.y, 2),
        };
        if (
          looseMouse.x === looseDownMouse.x &&
          looseMouse.y === looseDownMouse.y
        ) {
          this._raycast();
        }
      },
      false
    );

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

  _updateMousePosition(evt) {
    const { width, height } = getSize(this.root);
    this.mouse.x = (evt.clientX / width) * 2 - 1;
    this.mouse.y = -(evt.clientY / height) * 2 + 1;
  }

  _raycast() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );
    if (intersects.length) {
      const { object } = intersects[0];
      const tag = object.name;
      if (tag) {
        this.setActiveSection(tag);
      }
    }
  }

  _render() {
    this.renderer.render(this.scene, this.camera);
  }

  _loop() {
    requestAnimationFrame(this._loop);
    this.controls.update();
  }

  /**
   * Actions
   */

  dispatch(settings) {
    const section = this.sections.filter((s) => s.isActive())[0];
    section.updateMaterial(settings);
    this._render();
  }

  setActiveSection(tag) {
    const updateSections = this.sections.map((section) => {
      if (tag === section.tag) {
        section.setActive(true);
        section.flash(this);
      } else {
        section.setActive(false);
      }
      return section;
    });
    this.sections = updateSections;
  }
}
