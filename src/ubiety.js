/**
 * The main class for building a Ubiety instance
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 */

import _ from "lodash";
import { tween } from "shifty";
import { Math as ThreeMath } from "three";

/**
 * Post processing
 */
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass";

import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "three/examples/jsm/libs/dat.gui.module";

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

import { getSize, sortObjectByArray } from "./utils";
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
    this.gltfLoader = getGLTFLoader(this.modelManager);
    this.controls = getNewControls(this.camera, this.renderer.domElement);
    this.raycaster = getNewRaycaster();
    this._loop = this._loop.bind(this);

    /**
     * Post Processing
     * */

    this.addSSAO = false;
    this.effectComposer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.effectPass = new SSAOPass(this.scene, this.camera);

    /**
     * Debugging
     * */

    this.debug = false;
    this.stats = new Stats();
    this.gui = null;
    this.renderInLoop = false;
    /**
     * State
     * */

    this.model = null;
    this.sections = [];
    this.activeSection = null;
    this.mouse = { x: 0, y: 0 };
    this.ui = {};
  }

  /**
   * Mounting phase
   * */

  mount() {
    this._createEvents();

    // sortObjectByArray

    if (this.debug) {
      this.gui = new GUI();
      document.body.appendChild(this.stats.dom);
      this.gui.add(this.effectPass, "kernelRadius").min(0).max(32);
      this.gui.add(this.effectPass, "minDistance").min(0.001).max(0.02);
      this.gui.add(this.effectPass, "maxDistance").min(0.01).max(0.3);
    }

    this.gltfLoader.load(this.modelPath, (gltf) => {
      const { scene: model } = gltf;
      const unorderedSections = [];

      let idx = 0;
      model.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          const name = o.name.split("|");
          o.name = name[0];
          o.disabled = name[1] === "disable";

          const materialSettings = this.settings.initialMaterials.filter(
            (material) => material.tag === o.name
          );

          const section = new Section(o, idx, this);
          section.updateMaterial(materialSettings[0]);

          if (o.name === this.settings.order[0] || idx === 0) {
            section.setActive(true);
            this.activeSection = section;
          }

          unorderedSections.push(section);
          if (section.isEnabled()) {
            // eslint-disable-next-line no-plusplus
            idx++;
          }
        }
      });

      this.sections = sortObjectByArray(
        unorderedSections,
        this.settings.order,
        "tag",
        true
      );

      model.position.y += this.settings.worldOffset;
      this.model = model;

      this.scene.add(model);
    });

    this.modelManager.onLoad = () => {
      this._buildEngine();
      this._buildCoreUI();
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
      if (!this.renderInLoop) {
        this._render();
      }
    });
  }

  _buildEngine() {
    const { lights } = theme;
    const { width, height } = getSize(this.root);
    lights.forEach((light) => this.scene.add(light));

    this.root.appendChild(this.renderer.domElement);
    this.effectComposer.addPass(this.renderPass);
    this.effectPass.setSize(width, height);
    this.effectPass.kernelRadius = 10;
    this.effectPass.minDistance = 0.5;
    this.effectPass.maxDistance = 1;
    if (this.addSSAO) this.effectComposer.addPass(this.effectPass);
    this._updateAspect();

    this._loop();
    this._spinOnLoad();
  }

  _buildCoreUI() {
    this._renderSectionSelector();
  }

  /**
   * Runtime phase
   * */

  _updateAspect() {
    const { width, height } = getSize(this.root);
    this.camera.aspect = width / height;
    this.renderer.setSize(width, height);
    this.effectComposer.setSize(width, height);
    this.camera.updateProjectionMatrix();
    this._render();
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

  _spinOnLoad() {
    const toDeg = ThreeMath.degToRad(360);
    tween({
      from: { deg: 0 },
      to: { deg: toDeg },
      duration: 3000,
      easing: "swingFromTo",
      render: (state) => {
        this.model.rotation.y = state.deg;
        if (!this.renderInLoop) {
          this._render();
        }
      },
    }).then(() => console.log("All done!"));
  }

  _render() {
    if (this.debug) {
      this.stats.begin();
      this.effectComposer.render();
      this.stats.end();
    } else {
      this.effectComposer.render();
    }
  }

  _loop() {
    requestAnimationFrame(this._loop);
    if (this.renderInLoop) {
      this._render();
    }
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
      if (tag === section.tag && !section.isDisabled()) {
        section.setActive(true);
        section.flash(this);
        this.activeSection = section;
        this._updateSectionSelector();
      } else {
        section.setActive(false);
      }
      return section;
    });
    this.sections = updateSections;
  }

  /**
   * UI Rendering
   * */

  _renderSectionSelector() {
    const availableSections = this.sections.filter((section) =>
      section.isEnabled()
    );

    this.ui.sectionCount = availableSections.length;

    /** Nodes */
    const uiSelectorWrapper = document.createElement("section");
    const uiSelectorColLeft = document.createElement("div");
    const uiSelectorColRight = document.createElement("div");
    const uiSelectorTitle = document.createElement("h2");
    const uiBreadcrumb = document.createElement("span");

    /** Classes */
    uiSelectorWrapper.classList.add("ubiety__wrapper");
    uiSelectorColLeft.classList.add("ubiety__col");
    uiSelectorColRight.classList.add("ubiety__col");
    uiSelectorTitle.classList.add("ubiety__selector-title");
    uiBreadcrumb.classList.add("ubiety__breadcrumb");

    /** Store */

    this.ui.selectorTitle = uiSelectorTitle;
    this.ui.breadcrumb = uiBreadcrumb;

    /** Sort */
    uiSelectorColLeft.appendChild(this.ui.breadcrumb);
    uiSelectorColLeft.appendChild(this.ui.selectorTitle);
    uiSelectorWrapper.appendChild(uiSelectorColLeft);
    uiSelectorWrapper.appendChild(uiSelectorColRight);

    this.root.appendChild(uiSelectorWrapper);
    this._updateSectionSelector();
  }

  _updateSectionSelector() {
    this.ui.selectorTitle.innerHTML = this.activeSection.getNameAsLabel();
    this.ui.breadcrumb.innerHTML = `${this.activeSection.index + 1}/${
      this.ui.sectionCount
    }`;
  }
}
