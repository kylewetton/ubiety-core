import { exists, isElement } from "../../src/utils/error";

test("Returns true when subject exists", () => {
  const root = "#app";
  expect(exists(root, "No root found.")).toBeTruthy();
});

test("Throws error when subject doesn't exists", () => {
  let root;
  expect(() => exists(root, "No root found.")).toThrow("No root found.");
});

test("isElement returns true if an element was passed to it.", () => {
  document.body.innerHTML = "<div id='root'></div>";
  const root = document.getElementById("root");
  expect(isElement(root, "No root found")).toBeTruthy();
});

test("isElement throws error when no root is found", () => {
  // Set up our document body
  document.body.innerHTML = "";
  const root = document.getElementById("root");
  expect(() => isElement(root, "No root found")).toThrow("No root found");
});
