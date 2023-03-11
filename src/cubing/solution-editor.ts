import { Alg } from "./cube/alg.js";
import { Cube } from "./cube/cube.js";
import { AlgTextarea } from "./cubing-templates.js";

const scrambleInput = document.getElementById("scramble-input") as AlgTextarea;
const solutionInput = document.getElementById("solution-input") as AlgTextarea;

const cubeNode = document.createElement("div");
document.body.appendChild(cubeNode);

let cube = new Cube(3);
document.documentElement.style.setProperty("--layer-count", cube.getLayerCount().toString());
cube.html(cubeNode);

let scramble = new Alg([]);
let solution = new Alg([]);

function resizeCube(size: number): void {
    cube = new Cube(size);
    document.documentElement.style.setProperty("--layer-count", cube.getLayerCount().toString());
    updateCube();
}

function updateCube(): void {
    cube.reset();
    cube.execute(scramble);
    cube.execute(solution);
    cube.html(cubeNode);
}

scrambleInput.addEventListener("alg-parse", ((event: CustomEvent<Alg>) => {
    scramble = event.detail;
    updateCube();
}) as EventListener);
solutionInput.addEventListener("alg-parse", ((event: CustomEvent<Alg>) => {
    solution = event.detail;
    updateCube();
}) as EventListener);


const puzzleSizeSelect = document.getElementById("puzzle-size") as HTMLSelectElement;
puzzleSizeSelect.addEventListener("change", () => {
    resizeCube(Number.parseInt(puzzleSizeSelect.value));
});

const loadTwizzleButton = document.getElementById("load-twizzle-button") as HTMLButtonElement;
loadTwizzleButton.addEventListener("click", event => {
    const url = new URL(prompt("Enter Twizzle URL") ?? "");

    let scrambleString = url.searchParams.get("setup-alg") ?? "";
    let solutionString = url.searchParams.get("alg") ?? "";

    (scrambleInput.querySelector("textarea") as HTMLTextAreaElement).value = scrambleString;
    (solutionInput.querySelector("textarea") as HTMLTextAreaElement).value = solutionString;
    
    scramble = Alg.fromString(scrambleString);
    solution = Alg.fromString(solutionString);
    
    let puzzleSize = Number.parseInt(url.searchParams.get("puzzle")?.[0] ?? "");
    resizeCube(isNaN(puzzleSize) ? 3 : puzzleSize);

    event.preventDefault();
});

const loadAlgCubingNetButton = document.getElementById("load-alg-cubing-net-button") as HTMLButtonElement;
loadAlgCubingNetButton.addEventListener("click", event => {
    const url = new URL(prompt("Enter alg.cubing.net URL") ?? "");

    let scrambleString = url.searchParams.get("setup") ?? "";
    let solutionString = url.searchParams.get("alg") ?? "";

    scrambleString = scrambleString.replace(/_/g, " ").replace(/-/g, "'");
    solutionString = solutionString.replace(/_/g, " ").replace(/-/g, "'");

    (scrambleInput.querySelector("textarea") as HTMLTextAreaElement).value = scrambleString;
    (solutionInput.querySelector("textarea") as HTMLTextAreaElement).value = solutionString;
    
    scramble = Alg.fromString(scrambleString);
    solution = Alg.fromString(solutionString);
    
    let puzzleSize = Number.parseInt(url.searchParams.get("puzzle")?.[0] ?? "");
    resizeCube(isNaN(puzzleSize) ? 3 : puzzleSize);

    event.preventDefault();
});