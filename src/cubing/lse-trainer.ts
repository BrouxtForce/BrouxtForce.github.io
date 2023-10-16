import { Alg } from "./cube/alg.js";
import { Cube } from "./cube/cube.js";
import { FastLSE } from "./solver/fast-lse.js";

const cubeContainerNode = document.querySelector(".cube-container") as HTMLElement;
const solutionContainerNode = document.querySelector(".solution-container") as HTMLElement;
function nextState(): void {
    const randomState = FastLSE.getRandomState();

    const cube = Cube.fromString(FastLSE.stateToString(randomState));
    cube.html(cubeContainerNode);

    const scramble = FastLSE.solve(randomState, 17)[0];
    console.log(`Scramble: ${Alg.fromString(scramble).invert().toString()}`);

    const solutions = FastLSE.solveEOLR(randomState, 13);
    solutions.sort((a, b) => a.split(" ").length - b.split(" ").length);

    const nodes: HTMLElement[] = [];
    for (let i = 0; i < solutions.length; i++) {
        const textDiv = document.createElement("div");
        textDiv.textContent = `${solutions[i]} (${solutions[i].split(" ").length} STM)`;
        nodes.push(textDiv);
    }
    if (solutions.length === 0) {
        const textDiv = document.createElement("div");
        textDiv.textContent = "Failed to find solution.";
        nodes.push(textDiv);
    }
    solutionContainerNode.replaceChildren(...nodes);
}

const nextSolveButton = document.querySelector(".next-solve-button") as HTMLButtonElement;
nextSolveButton.addEventListener("click", () => {
    nextState();
});

FastLSE.initTable();

nextState();