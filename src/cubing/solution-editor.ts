import { Alg } from "./cube/alg.js";
import { Cube } from "./cube/cube.js";
import { AlgTextarea } from "./cubing-templates.js";

const scrambleInput = document.getElementById("scramble-input") as AlgTextarea;
const solutionInput = document.getElementById("solution-input") as AlgTextarea;

const cubeContainer = document.getElementById("cube-container") as HTMLDivElement;
const cubeNode = document.createElement("div");
cubeContainer.appendChild(cubeNode);

let cube = new Cube(3);
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

const loadLinkButton = document.getElementById("load-link-button") as HTMLButtonElement;
loadLinkButton.addEventListener("click", event => {
    event.preventDefault();

    let url: URL;
    try {
        url = new URL(prompt("Paste link here.") ?? "");
    } catch (error: unknown) {
        alert("Invalid URL.");
        return;
    }

    let scrambleString: string, solutionString: string;
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

    
    scrambleInput.value = scrambleString;
    solutionInput.value = solutionString;

    // scramble = Alg.fromString(scrambleString);
    // solution = Alg.fromString(solutionString);
    
    // TODO: Load puzzles bigger than 9 (because I only read the first character)
    let puzzleNameString = url.searchParams.get("puzzle") ?? "3";
    let puzzleSize = Number.parseInt(puzzleNameString[0]);
    if (isNaN(puzzleSize) || puzzleSize < 2) {
        puzzleSize = 3;
    }
    if (cube.getLayerCount() !== puzzleSize) {
        resizeCube(puzzleSize);
    }
});

function generateLink(site: string, processString: boolean = false): string {
    const url = new URL(site);

    let scrambleString = scramble.toString();
    let solutionString = solution.toString();

    if (processString) {
        scrambleString = scrambleString.replace(/ /g, "_").replace(/'/g, "-");
        solutionString = solutionString.replace(/ /g, "_").replace(/'/g, "-");
    }

    let puzzleSize = cube.getLayerCount();
    let puzzleString = Array(3).fill(puzzleSize).join("x"); // Turns 3 into 3x3x3, 4 into 4x4x4, etc

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

const algCubingNetLinkButton = document.getElementById("gen-alg-cubing-net-link") as HTMLButtonElement;
algCubingNetLinkButton.addEventListener("click", event => {
    event.preventDefault();
    navigator.clipboard.writeText(generateLink("https://alg.cubing.net", true));
});

const twizzleLinkButton = document.getElementById("gen-twizzle-link") as HTMLButtonElement;
twizzleLinkButton.addEventListener("click", event => {
    event.preventDefault();
    navigator.clipboard.writeText(generateLink("https://alpha.twizzle.net/edit"));
});

const cubedbLinkButton = document.getElementById("gen-cubedb-link") as HTMLButtonElement;
cubedbLinkButton.addEventListener("click", event => {
    event.preventDefault();
    navigator.clipboard.writeText(generateLink("https://cubedb.net", true));
});

const invertAlgButton = document.getElementById("alg-invert-button") as HTMLButtonElement;
invertAlgButton.addEventListener("click", event => {
    event.preventDefault();
    solution.invert();
    solutionInput.value = solution.toString();
    updateCube();
});

const expandAlgButton = document.getElementById("alg-expand-button") as HTMLButtonElement;
expandAlgButton.addEventListener("click", event => {
    event.preventDefault();
    solution = new Alg(solution.expand());
    solutionInput.value = solution.toString();
    updateCube();
});

const stripCommentsButton = document.getElementById("alg-strip-comments-button") as HTMLButtonElement;
stripCommentsButton.addEventListener("click", event => {
    event.preventDefault();
    solution.stripComments();
    solutionInput.value = solution.toString();
});

const formatAlgButton = document.getElementById("alg-format-button") as HTMLButtonElement;
formatAlgButton.addEventListener("click", event => {
    event.preventDefault();
    solution.removeWhitespace();
    solution.addWhitespace();
    solutionInput.value = solution.toString();
});

const simplifyAlgButton = document.getElementById("alg-simplify-button") as HTMLButtonElement;
simplifyAlgButton.addEventListener("click", event => {
    event.preventDefault();
    solution.simplify();
    solution.removeWhitespace();
    solution.addWhitespace();
    solutionInput.value = solution.toString();
});