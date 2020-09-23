/* eslint-disable class-methods-use-this */
/**
 * The main class for building a Ubiety instance
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 */

import _ from 'lodash';
import {
  tween,
} from 'shifty';
import {
  PMREMGenerator,
  UnsignedByteType,
  Math as ThreeMath,
} from 'three';

import './styles/index.scss';

/**
 * Post processing
 */
import {
  EffectComposer,
} from 'three/examples/jsm/postprocessing/EffectComposer';
import {
  RenderPass,
} from 'three/examples/jsm/postprocessing/RenderPass';
import {
  SSAOPass,
} from 'three/examples/jsm/postprocessing/SSAOPass';

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

import Stats from 'three/examples/jsm/libs/stats.module';
import {
  GUI,
} from 'three/examples/jsm/libs/dat.gui.module';

import {
  isElement,
  exists,
} from './utils/error';
import {
  defaults,
  icons,
} from './config';
import {
  getNewScene,
  getNewRenderer,
  getNewCamera,
  getNewLoadingManager,
  getGLTFLoader,
  getGLTFExporter,
  getNewControls,
  getNewRaycaster,
  theme,
} from './engine';

import {
  getSize,
  sortObjectByArray,
  cleanScale,
  isTouchDevice,
} from './utils';
import Section from './sections';

/** @module Ubiety */

class Ubiety {
  /**
   * Ubiety
   * @class Ubiety
   * @throws {Error} When the given root element or selector is invalid.
   *
   * @param {Element|string}  root       - A selector for a root element or an element itself.
   * @param {string}  modelPath          - The path of the .gLTF(glb) model.
   * @param {Object}  settings   - Optional. Options to change default behaviour.
   */
  constructor(root, modelPath, settings = {}) {

        /**
     * Settings, deep merged with the defaults Object found in the config file.
     * @type {Object}
     */
    this.settings = _.defaultsDeep({}, settings, defaults);


    /**
     * The root element that Ubiety will append a child to, this element's height
     * and width will be used to determine the canvas size itself. The canvas
     * should never be directly adjusted in height and width.
     * @type Element
     */
    this.root = root instanceof Element ? root : document.querySelector(root);
    if (!this.settings.headlessMode) {
      isElement(
        this.root,
        "Couldn't find the root element. Make sure it exists.",
      );
  }

    /**
     * A path to the .gLTF/.glb model to be loaded on initialization of this class.
     * @type {String}
     */
    this.modelPath = exists(modelPath, 'Please provide a path to the model.');


    /**
     * A ThreeJS scene, the main 3D scene rendered in the canvas.
     * @type {Class}
     */
    this.scene = getNewScene(this.settings.backgroundColor);

    /**
     * A ThreeJS WebGLRenderer. Settings for this renderer can be found in the config file.
     * @type {Class}
     */
    this.renderer = getNewRenderer();

    /**
     * A ThreeJS Perspective camera. Settings for this camera can be found in the config file.
     * @type {Class}
     */
    this.camera = getNewCamera();

    /**
     * A ThreeJS LoadingManager, this controls events during the start of the model loading process, during the process, and once it's loaded.
     * @type {Class}
     */
    this.modelManager = getNewLoadingManager();

    /**
     * A GLTFLoader, a module used to load the model file
     * @type {Class}
     */
    this.gltfLoader = getGLTFLoader(this.modelManager);

    /**
     * A GLTFExporter, a module used to export the model file
     * @type {Class}
     */
    this.gltfExporter = getGLTFExporter();

    /**
     * An instance of OrbitControls. Settings for these controls are found in the config file.
     * @type {Class}
     */
    this.controls = getNewControls(this.camera, this.renderer.domElement);

    /**
     * A ThreeJS Raycaster. Controls click events within the ThreeJS scene.
     * @type {Class}
     */
    this.raycaster = getNewRaycaster();

    /**
     * An animation loop, firing 60 frames per second.
     */
    this._loop = this._loop.bind(this);

    /**
     * Depricated. TODO: Replace with FXAA
     */
    this.addSSAO = false;

    /**
     * A ThreeJS EffectComposer, used to combine a standard render pass and a post-processing effect
     * @type {Class}
     */
    this.effectComposer = new EffectComposer(this.renderer);

    /**
     * A standard render pass used within the EffectComposer class.
     * @type {Class}
     */
    this.renderPass = new RenderPass(this.scene, this.camera);

    /**
     * An effects pass used to post-process the render pass.
     */
    this.effectPass = new SSAOPass(this.scene, this.camera);

    /**
     * When set active, a framerate indicator displays in the top corner of the scene
     * @default false
     * @type {Boolean}
     */
    this.debug = false;

    /**
     * A Stats class used internally, this generates the framerate indictor when debug mode is true.
     */

    this.stats = new Stats();

    /**
     * GUI used in internally for development.
     */

    this.gui = null;

    /**
     * When set active, the renderer will refresh constantly as opposed to only when the scene camera moves or colours are changed within
     * the model. This has a performance impact but is worth activing if post-processing relies on it.
     * @default false
     * @type {Boolean}
     */
    this.renderInLoop = false;

    /**
     * The model is stored here once it's loaded by the GLTFLoader. This houses the GLTF Scene only, animations are not stored.
     * @type {Class}
     * @default null
     */
    this.model = null;

    /** An array of Section classes used internally
     * @type {Array}
     * @default empty
     */
    this.sections = [];

    /** A reference to the active section. Used internally */
    this.activeSection = null;

    this.mouse = {
      x: 0,
      y: 0,
    };
    this.ui = {};
    this.materials = {};
    this.events = {};
    this.initialMaterialsLoaded = false;
    this.inArMode = false;
    this.frozen = false;
  }

  /**
   * Mounting phase
   * */

  mount() {
    if (this.root) this.root.style.cssText += 'height: 100%; position: relative';

    if (this.debug) {
      this.gui = new GUI();
      document.body.appendChild(this.stats.dom);
      this.gui.add(this.effectPass, 'kernelRadius').min(0).max(32);
      this.gui.add(this.effectPass, 'minDistance').min(0.001).max(0.02);
      this.gui.add(this.effectPass, 'maxDistance').min(0.01).max(0.3);
    }

    this.gltfLoader.load(
      this.modelPath,
      (gltf) => {
        let {
          scene: model,
        } = gltf;
        const unorderedSections = [];

        let idx = 0;
        model.traverse((o) => {
          if (o.isMesh && this.settings.realtimeShadows) {
            o.receiveShadow = true;
            o.castShadow = true;
          }
          if (o.isMesh || o.type === 'Object3D') {
            if (!this.settings.groups.includes(o.parent.name)) {
              const name = o.name.split('|');
              o.name = name[0];
              o.disabled = name[1] === 'disable';

              const materialSettings = this.settings.initialMaterials.filter(
                (material) => material.tag === o.name,
              )[0];

              const section = new Section(o, idx, this);

              /** Children */

              if (this.settings.groups.includes(o.name)) {
                section.mesh.children.forEach((child, i) => {
                  const childSection = new Section(child, i, this);
                  childSection.setAsChild(o.name);
                  childSection.setAbility(o.disabled);
                  section.children.push(childSection);
                });
                if (o.type === 'Object3D') this._setupChildOptions(section);
              }

              if (
                this.settings.order.length
                && o.name === this.settings.order[0]
                && section.isEnabled()
              ) {
                section.setActive(true);
                this.activeSection = section;
              } else if (idx === 0 && section.isEnabled()) {
                section.setActive(true);
                this.activeSection = section;
              }

              section.updateMaterial({
                ...materialSettings,
              });

              unorderedSections.push(section);
              if (section.isEnabled()) {
                // eslint-disable-next-line no-plusplus
                idx++;
              }
            }
          }
        });

        this.sections = sortObjectByArray(
          unorderedSections,
          this.settings.order,
          'tag',
          true,
        );

        model.position.y += this.settings.worldOffset;
        model = cleanScale(this.settings.scale, model);
        this.model = model;

        this.scene.add(this.model);
        document.dispatchEvent(
          new CustomEvent('Ubiety:sectionChange', {
            detail: this.activeSection,
          }),
        );
      },
      (xhr) => {
        /**
         * Chrome issue where Gzipped content doesn't provide a computable length
         * Needs to be resolved
         */
        document.dispatchEvent(
          new CustomEvent('Ubiety:onProgress', {
            detail: (xhr.loaded / xhr.total) * 100,
          }),
        );
      },
    );

    this.modelManager.onLoad = () => {
      if (!this.settings.headlessMode) {
        this._createEvents();
        this._buildEngine();
        this._updateSectionIndexes();
        this._buildCoreUI();
      }
    };
  }

  _createEvents() {
    const listeners = {
      touch: {
        down: 'touchstart',
        up: 'touchend',
        move: 'touchmove',
      },
      mouse: {
        down: 'mousedown',
        up: 'mouseup',
        move: 'mousemove',
      },
    };

    const device = isTouchDevice() ? 'touch' : 'mouse';

    window.addEventListener('resize', () => {
      this._updateAspect();
    });

    /**
     * Move is required to determine whether the user
     * is orbiting the model or clicking on it.
     */

    window.addEventListener(
      listeners[device].move,
      (evt) => this._updateMousePosition(evt, isTouchDevice()),
      true,
    );

    this.renderer.domElement.addEventListener(
      listeners[device].down,
      (evt) => {
        this._updateMousePosition(evt, isTouchDevice());
        this.mouseDownPosition = {
          ...this.mouse,
        };
      },
      false,
    );

    this.renderer.domElement.addEventListener(
      listeners[device].up,
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
          looseMouse.x === looseDownMouse.x
          && looseMouse.y === looseDownMouse.y
        ) {
          this._raycast();
        }
      },
      false,
    );

    this.controls.addEventListener('change', () => {
      if (!this.renderInLoop) {
        this._render();
      }
    });
  }

  _buildEngine() {
    const {
      lights,
    } = theme;
    const {
      width,
      height,
    } = getSize(this.root);
    if (!this.settings.hdrMap) {
      lights.forEach((light) => this.scene.add(light));
    } else {
      this.renderer.toneMappingExposure = this.settings.hdrExposure || 1;
      const pmremGenerator = new PMREMGenerator(this.renderer);
      pmremGenerator.compileEquirectangularShader();

      new RGBELoader()
        .setDataType(UnsignedByteType)
        .setPath('ubiety/')
        .load(`${this.settings.hdrMap}.hdr`, (texture) => {
          const envMap = pmremGenerator.fromEquirectangular(texture).texture;
          if (this.settings.hdrRenderBackground) {
            this.scene.background = envMap;
          }
          this.scene.environment = envMap;

          texture.dispose();
          pmremGenerator.dispose();

          this._render();
        });
    }

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

  _getPersistentTexture(tag) {
    const pTexture = this.settings.persistentTextures.filter(
      (texture) => texture.tag === tag,
    )[0];

    return pTexture || {};
  }

  /**
   * Runtime phase
   * */

  _updateAspect() {
    const {
      width,
      height,
    } = getSize(this.root);
    this.camera.aspect = width / height;
    this.renderer.setSize(width, height);
    this.effectComposer.setSize(width, height);
    this.camera.updateProjectionMatrix();
    this._render();
  }

  _updateMousePosition(evt, isMobile) {
    const {
      width,
      height,
    } = getSize(this.root);
    this.mouse.x = isMobile ? (evt.touches[0].clientX / width) * 2 - 1 : (evt.clientX / width) * 2 - 1;
    this.mouse.y = isMobile ? -(evt.touches[0].clientY / height) * 2 + 1 : -(evt.clientY / height) * 2 + 1;
  }

  _raycast() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true,
    );
    if (intersects.length) {
      const {
        object,
      } = intersects[0];
      const isChild = this.settings.groups.includes(object.parent.name);
      const tag = isChild ? object.parent.name : object.name;
      const section = this.sections.filter((s) => tag === s.getTag())[0];
      if (tag && section.isEnabled()) {
        this.setActiveSection(tag);
      }
    }
  }

  _spinOnLoad() {
    const toDeg = ThreeMath.degToRad(360);
    tween({
      from: {
        deg: 0,
      },
      to: {
        deg: toDeg,
      },
      duration: 3000,
      delay: 500,
      easing: 'swingFromTo',
      render: (state) => {
        this.model.rotation.y = state.deg;
        if (!this.renderInLoop) {
          this._render();
        }
      },
    });
  }

  _render() {
    if (!this.settings.headlessMode) {
      if (this.debug) {
        this.stats.begin();
        this.effectComposer.render();
        this.stats.end();
      } else {
        this.effectComposer.render();
      }
  }
  }

  _loop() {
    requestAnimationFrame(this._loop);
    if (this.renderInLoop) {
      this._render();
    }
    this.controls.update();
    if (this.inArMode) {
      this.arCamera.updateFrame(this.renderer);
      this._render(true);
    }
  }

  /**
   * Actions
   */

  swapColor(hex) {
    const section = this.sections.filter((s) => s.isActive())[0];
    const hasCustomImage = section.materialAsSettings.texture.url;
    if (section) {
      section.swapColor(hasCustomImage ? '#FFFFFF' : hex);
      this._render();
    }
  }

  swapTexture(txt) {
    const section = this.sections.filter((s) => s.isActive())[0];
    section.swapTexture(txt);
    this._render();
  }

  swapOption(tag, optionTag = null) {
    let availableSections = [];
    const section = this.sections.find((s) => s.getTag() === tag);
    if (section.isDisabled() && optionTag) {
      section.setAbility(false);
    } else if (section.isEnabled() && !optionTag) {
      section.setAbility(true);
    }

    section.children = section.children.map((child) => {
      if (child.tag === optionTag) {
        child.setVisibility(true);
      } else {
        child.setVisibility(false);
      }
      return child;
    });

    availableSections = this.sections.filter((s) => s.isEnabled());

    this.ui.sectionCount = availableSections.length;
    if (optionTag) {
      this.setActiveSection(section.getTag());
    } else {
      this.setActiveSection(availableSections[0].getTag());
    }
    this._render();
  }

  setActiveSection(tag) {
    if (!this.frozen) {
    const updateSections = this.sections.map((section) => {
      if (tag === section.tag && section.isEnabled()) {
        section.setActive(true);
        section.flash();
        this.activeSection = section;
        this._updateSectionSelector();
      } else {
        section.setActive(false);
      }
      return section;
    });
    this.sections = updateSections;

    document.dispatchEvent(
      new CustomEvent('Ubiety:sectionChange', {
        detail: this.activeSection,
      }),
    );
    }
  }

  nextSection() {
    this._jumpSection();
  }

  prevSection() {
    this._jumpSection(-1);
  }

  _jumpSection(modifier = 1) {
    const availableSections = this.sections.filter((section) => section.isEnabled());
    const currentIndex = this.activeSection.getIndex();
    let next = availableSections.filter(
      (section) => section.index === currentIndex + modifier,
    )[0];
    if (!next) {
      if (modifier === 1) {
        // eslint-disable-next-line prefer-destructuring
        next = availableSections[0];
      } else {
        next = availableSections[availableSections.length - 1];
      }
    }
    this.setActiveSection(next.getTag());
  }

  snapshots() {
    const positions = {
      outer: [-3.5, 0.3, 0.5],
      inner: [3.5, 0.3, 0.5],
      top: [-0.5, 3, 0],
      back: [0, 0.3, -3.5],
      front: [0, 0.3, 3.5],
      angle: [-2, 0.3, 2.5],
    };
    const poses = ['top', 'outer', 'back', 'inner', 'front', 'angle'];

    const link = document.createElement('a');

    const takePhoto = (pose) => {
      link.download = `${pose}.png`;
      link.href = this.renderer.domElement.toDataURL();
      link.click();
    };

    const move = (coords, i) => {
      const from = {
        ...this.camera.position,
      };
      const to = {
        x: coords[0],
        y: coords[1],
        z: coords[2],
      };
      tween({
        from,
        to,
        duration: 500,
        step: (state) => {
          this.camera.position.set(state.x, state.y, state.z);
        },
      }).then(() => {
        takePhoto(poses[i]);
        if (i < poses.length - 1) {
          const nextCoords = positions[poses[i + 1]];
          move(nextCoords, i + 1);
        }
      });
    };

    const coords = positions[poses[0]];
    move(coords, 0);
  }

  // eslint-disable-next-line class-methods-use-this
  _setupChildOptions(section) {
    const { children } = section;
    section.setAbility(true);
    children.forEach((child) => {
      child.setVisibility(false);
    });
  }

  _updateSectionIndexes() {
    let idx = 0;
    this.sections = this.sections.map((section) => {
      if (section.isEnabled()) {
        section.setIndex(idx);
        // eslint-disable-next-line no-plusplus
        idx++;
      } else {
        section.setIndex(null);
      }
      return section;
    });
  }

  freezeControl() {
    this.frozen = true;
  }

  unfreezeControl() {
    this.frozen = false;
  }

  /**
   * Augmented Reality
   */

  launchAR(excludes = [], scale = 1) {
    document.dispatchEvent(new Event('Ubiety:processingAR'));
    this._exportGLTF(excludes, scale).then((glb) => {
      const fd = new FormData();
      fd.append('glb', new Blob([glb]));
      fetch('/ubiety-ar', {
        method: 'POST',
        body: fd,
      }).then((res) => res.json()).then((data) => {
        const { name } = data;
        const isAndroid = /android/i.test(navigator.userAgent);
        const link = document.createElement('a');

        if (isAndroid) {
          link.href = `intent://arvr.google.com/scene-viewer/1.0?file=${window.location.origin}/ubiety/ar/ar-${name}.glb&mode=ar_only#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${window.location.origin};end;`;
        } else {
          link.href = `ubiety/ar/ar-${name}.usdz`;
          link.rel = 'ar';
          link.innerHTML = '<img src="ubiety/ar.png" />';
        }
        if (isTouchDevice()) {
          link.click();
          document.dispatchEvent(new Event('Ubiety:lauchingAR'));
        } else {
          document.dispatchEvent(new Event('Ubiety:lauchingAR'));
          document.dispatchEvent(new CustomEvent('Ubiety:QRCodeReady', {
            detail: this._getQRCodeForARFile(`${name}.usdz`),
          }));
        }
      });
    });
  }

  _exportGLTF(excludes, scale) {
    return new Promise((res, rej) => {
      const cleaned = _.defaultsDeep({}, this.model);
      cleaned.parent = null;
      cleaned.children = cleaned.children.filter((child) => !excludes.includes(child.name));
      cleaned.scale = { x: scale, y: scale, z: scale };
      this.gltfExporter.parse(cleaned, (gltf) => {
        res(gltf);
      }, { binary: true });
    });
  }

  _getQRCodeForARFile(file) {
    const base = window.location.origin;
    const api = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${base}/ubiety/ar/ar-${file}`;
    return api;
  }

  /**
   * UI Rendering
   * */

  _renderSectionSelector() {
    const selectorParent = this.settings.selectorParent || this.root;
    const availableSections = this.sections.filter((section) => section.isEnabled());
    this.ui.sectionCount = availableSections.length;

    /** Nodes */
    const uiSelectorWrapper = document.createElement('section');
    const uiSelectorColLeft = document.createElement('div');
    const uiSelectorColRight = document.createElement('div');
    const uiSelectorTitle = document.createElement('h2');
    const uiCurrentSection = document.createElement('div');
    const uiBreadcrumb = document.createElement('span');
    const uiSectionMenu = document.createElement('button');
    const uiNextSection = document.createElement('button');
    const uiPrevSection = document.createElement('button');

    /** Classes */
    uiSelectorWrapper.classList.add('ubiety__section-selector');
    uiSelectorColLeft.classList.add('ubiety__col', 'ubiety__col--left');
    uiSectionMenu.classList.add('ubiety__section-menu');
    uiSelectorColRight.classList.add('ubiety__col', 'ubiety__col--right');
    uiSelectorTitle.classList.add('ubiety__selector-title');
    uiBreadcrumb.classList.add('ubiety__breadcrumb');
    uiNextSection.classList.add('ubiety__next-section', 'ubiety__jump-section');
    uiPrevSection.classList.add('ubiety__prev-section', 'ubiety__jump-section');

    /** Store */
    this.ui.selectorTitle = uiSelectorTitle;
    this.ui.breadcrumb = uiBreadcrumb;

    uiNextSection.innerHTML = `<i class="icon-next">${icons.right}</i>`;
    uiPrevSection.innerHTML = `<i class="icon-prev">${icons.right}</i>`;
    uiSectionMenu.innerHTML = `<i class="icon-menu">${icons.menu}</i>`;

    /** Events */

    uiNextSection.addEventListener('click', () => {
      this.nextSection();
    });

    uiPrevSection.addEventListener('click', () => {
      this.prevSection();
    });

    /** Sort */

    uiCurrentSection.appendChild(this.ui.breadcrumb);
    uiCurrentSection.appendChild(this.ui.selectorTitle);
    uiSelectorColLeft.appendChild(uiSectionMenu);
    uiSelectorColLeft.appendChild(uiCurrentSection);

    uiSelectorColRight.appendChild(uiPrevSection);
    uiSelectorColRight.appendChild(uiNextSection);

    uiSelectorWrapper.appendChild(uiSelectorColLeft);
    uiSelectorWrapper.appendChild(uiSelectorColRight);

    if (selectorParent === this.root) {
      uiSelectorWrapper.classList.add('pin');
    }
    selectorParent.appendChild(uiSelectorWrapper);
    this._updateSectionSelector();
    window.dispatchEvent(new Event('resize'));
  }

  _updateSectionSelector() {
    this.ui.selectorTitle.innerHTML = this.activeSection.getTagAsLabel();
    this.ui.breadcrumb.innerHTML = `${this.activeSection.index + 1} / ${
      this.ui.sectionCount
    }`;
  }
}

export default Ubiety;
