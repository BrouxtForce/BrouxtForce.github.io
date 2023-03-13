import { Alg } from "./cube/alg.js";
import { Cube } from "./cube/cube.js";
const scrambleInput = document.getElementById("scramble-input");
const solutionInput = document.getElementById("solution-input");
const cubeContainer = document.getElementById("cube-container");
const cubeNode = document.createElement("div");
cubeContainer.appendChild(cubeNode);
let cube = new Cube(3);
cube.html(cubeNode);
let scramble = new Alg([]);
let solution = new Alg([]);
function resizeCube(size) {
    cube = new Cube(size);
    document.documentElement.style.setProperty("--layer-count", cube.getLayerCount().toString());
    updateCube();
}
function updateCube() {
    cube.reset();
    cube.execute(scramble);
    cube.execute(solution);
    cube.html(cubeNode);
}
scrambleInput.addEventListener("alg-parse", ((event) => {
    scramble = event.detail;
    updateCube();
}));
solutionInput.addEventListener("alg-parse", ((event) => {
    solution = event.detail;
    updateCube();
}));
const puzzleSizeSelect = document.getElementById("puzzle-size");
puzzleSizeSelect.addEventListener("change", () => {
    resizeCube(Number.parseInt(puzzleSizeSelect.value));
});
const loadLinkButton = document.getElementById("load-link-button");
loadLinkButton.addEventListener("click", event => {
    event.preventDefault();
    let url;
    try {
        url = new URL(prompt("Paste link here.") ?? "");
    }
    catch (error) {
        alert("Invalid URL.");
        return;
    }
    let scrambleString, solutionString;
    let shouldProcessString = false;
    switch (url.hostname) {
        case "alpha.twizzle.net":
            scrambleString = url.searchParams.get("setup-alg") ?? "";
            solutionString = url.searchParams.get("alg") ?? "";
            break;
        case "cubedb.net":
            scrambleString = url.searchParams.get("scramble") ?? "";
            solutionString = url.searchParams.get("alg") ?? "";
            shouldProcessString = true;
            break;
        case "alg.cubing.net":
            scrambleString = url.searchParams.get("setup") ?? "";
            solutionString = url.searchParams.get("alg") ?? "";
            shouldProcessString = true;
            break;
        default:
            alert(`Unknown hostname: ${url.hostname}`);
            return;
    }
    if (shouldProcessString) {
        scrambleString = scrambleString.replace(/_/g, " ").replace(/-/g, "'");
        solutionString = solutionString.replace(/_/g, " ").replace(/-/g, "'");
    }
    scrambleInput.querySelector("textarea").value = scrambleString;
    solutionInput.querySelector("textarea").value = solutionString;
    scramble = Alg.fromString(scrambleString);
    solution = Alg.fromString(solutionString);
    let puzzleNameString = url.searchParams.get("puzzle") ?? "3";
    let puzzleSize = Number.parseInt(puzzleNameString[0]);
    if (isNaN(puzzleSize) || puzzleSize < 2) {
        puzzleSize = 3;
    }
    resizeCube(puzzleSize);
});
function generateLink(site, processString = false) {
    const url = new URL(site);
    let scrambleString = scramble.toString();
    let solutionString = solution.toString();
    if (processString) {
        scrambleString = scrambleString.replace(/ /g, "_").replace(/'/g, "-");
        solutionString = solutionString.replace(/ /g, "_").replace(/'/g, "-");
    }
    let puzzleSize = cube.getLayerCount();
    let puzzleString = Array(3).fill(puzzleSize).join("x");
    switch (url.hostname) {
        case "alpha.twizzle.net":
            if (puzzleSize !== 3) {
                url.searchParams.set("puzzle", puzzleString);
            }
            url.searchParams.set("setup-alg", scrambleString);
            url.searchParams.set("alg", solutionString);
            break;
        case "cubedb.net":
            url.searchParams.set("puzzle", puzzleSize.toString());
            url.searchParams.set("scramble", scrambleString);
            url.searchParams.set("alg", solutionString);
            break;
        case "alg.cubing.net":
            if (puzzleSize !== 3) {
                url.searchParams.set("puzzle", puzzleString);
            }
            url.searchParams.set("setup", scrambleString);
            url.searchParams.set("alg", solutionString);
            break;
        default:
            console.error(`Unsupported site hostname: ${url.hostname}`);
            return "";
    }
    return url.toString();
}
const algCubingNetLinkButton = document.getElementById("gen-alg-cubing-net-link");
algCubingNetLinkButton.addEventListener("click", event => {
    event.preventDefault();
    navigator.clipboard.writeText(generateLink("https://alg.cubing.net", true));
});
const twizzleLinkButton = document.getElementById("gen-twizzle-link");
twizzleLinkButton.addEventListener("click", event => {
    event.preventDefault();
    navigator.clipboard.writeText(generateLink("https://alpha.twizzle.net/edit"));
});
const cubedbLinkButton = document.getElementById("gen-cubedb-link");
cubedbLinkButton.addEventListener("click", event => {
    event.preventDefault();
    navigator.clipboard.writeText(generateLink("https://cubedb.net", true));
});
