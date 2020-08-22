import { MeshPhongMaterial } from "three";
import _ from "lodash";
import { color } from "../utils";

const getNewMaterial = (options = {}) => {
  const defaults = {
    tag: "!",
    type: "phong",
    color: "#F1F1F1",
    texture: null,
  };

  const settings = _.defaultsDeep(options, defaults);

  const linearColor = color(settings.color);
  settings.color = linearColor;

  let material;
  switch (settings.type) {
    case "phong":
      material = new MeshPhongMaterial({
        color: settings.color,
      });
      break;
    default:
      material = new MeshPhongMaterial({ color: settings.color });
  }

  return material;
};

export default getNewMaterial;
