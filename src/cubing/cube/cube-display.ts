import { Cube } from "./cube.js";

const cubeStateDisplay = document.getElementById("cube-state-display") as HTMLDivElement;
const cubeStateInput = document.getElementById("cube-state-input") as HTMLInputElement;

cubeStateInput.addEventListener("input", event => {
    const cube = Cube.fromString(cubeStateInput.value);
    document.documentElement.style.setProperty("--layer-count", cube.getLayerCount().toString());
    cube.html(cubeStateDisplay);
});