/**
 * A class for generating a world theme (lighting and floor)
 *
 * @author    Kyle Wetton
 * @copyright Kyle Wetton. All rights reserved.
 * @class Theme
 */

import {
  HemisphereLight,
  DirectionalLight,
  SpotLight,
  Vector2,
  PlaneBufferGeometry,
  ShadowMaterial,
  MeshLambertMaterial,
  Mesh,
} from "three";

/**
 * A Theme class generates lights and the floor based on input
 */

class Theme {
  /**
   * Theme constructor.
   *
   *
   * @param {Object}    theme   - A description of the lights and floor in a theme.
   */

  constructor(theme) {
    this.settings = theme;
    this.lights = [];
    this.build();
  }

  build() {
    this.background = this.settings.background;
    this.buildLights();
    this.buildFloor();
  }

  buildLights() {
    const {
      lights
    } = this.settings;
    const hemi = lights.filter((light) => light.id === "hemi");
    const directional = lights.filter((light) => light.id === "directional");
    const spot = lights.filter((light) => light.id === "spot");

    hemi.forEach((light) => {
      const {
        x,
        y,
        z
      } = light.position;

      const hemiLight = new HemisphereLight(
        light.sky,
        light.ground,
        light.intensity
      );
      hemiLight.position.set(x, y, z);
      this.lights.push(hemiLight);
    });

    directional.forEach((light) => {
      const {
        x,
        y,
        z
      } = light.position;
      const d = 8.25;
      const directionalLight = new DirectionalLight(
        light.color,
        light.intensity
      );
      directionalLight.position.set(x, y, z);
      directionalLight.castShadow = light.shadows;
      directionalLight.shadow.mapSize = new Vector2(
        light.mapSize,
        light.mapSize
      );

      directionalLight.shadow.camera.near = 0.1;
      directionalLight.shadow.camera.far = 100;
      directionalLight.shadow.camera.left = d * -1;
      directionalLight.shadow.camera.right = d;
      directionalLight.shadow.camera.top = d;
      directionalLight.shadow.camera.bottom = d * -1;

      this.lights.push(directionalLight);
    });

    spot.forEach((light) => {
      const {
        x,
        y,
        z
      } = light.position;
      const spotLight = new SpotLight(light.color, light.intensity);
      spotLight.position.set(x, y, z);
      this.lights.push(spotLight);
    });
  }

  buildFloor() {
    const floorGeometry = new PlaneBufferGeometry(
      1500,
      this.settings.floor.depth,
      50,
      50
    );

    let floorMaterial;
    if (this.settings.floor.shadowOnly) {
      floorMaterial = new ShadowMaterial();
      floorMaterial.opacity = this.settings.floor.shadowOpacity;
    } else {
      floorMaterial = new MeshLambertMaterial({
        color: this.settings.floor.color,
      });
    }

    const floor = new Mesh(floorGeometry, floorMaterial);

    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;

    this.floor = floor;
  }
}

export default Theme;