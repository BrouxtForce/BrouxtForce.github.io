import { Cube } from "./cube/cube.js";
import { Alg } from "./cube/alg.js";
import { Scramble } from "./scramble.js";
import assert from "../utils/assert.js";

let cube = new Cube(3);

const cubeContainer = document.querySelector(".cube-container") as HTMLElement;
const nextScrambleButton = document.querySelector(".next-scramble") as HTMLElement;
const scrambleOutput = document.querySelector(".scramble") as HTMLElement;
const edgeMemoLabel = document.querySelector(".edge-memo-label") as HTMLElement;
const edgeMemoOutput = document.querySelector(".edge-memo") as HTMLElement;
const wingMemoLabel = document.querySelector(".wing-memo-label") as HTMLElement;
const wingMemoOutput = document.querySelector(".wing-memo") as HTMLElement;
const cornerMemoOutput = document.querySelector(".corner-memo") as HTMLElement;

const group = function(array: string[], amount: number): string {
    const grouped: string[] = [];
    for (let i = 0; i < array.length; i += amount) {
        let clump = "";
        for (let j = i; j < i + amount && j < array.length; j++) {
            clump += array[j];
        }
        grouped.push(clump);
    }
    return grouped.join(" ");
};

const edgeSpeffz = "AQBMCIDEJPLFRHTNUKVOWSXG";
const wingSpeffz = "QAMBICEDPJFLHRNTKUOVSWGX";
const cornerSpeffz = "AERBQNCMJDIFUGLVKPWOTXSH";

const edgeSpeffzToIndex = (speffz: string) => edgeSpeffz.indexOf(speffz);
const indexToEdgeSpeffz = (index: number) => edgeSpeffz[index];

const wingSpeffzToIndex = (speffz: string) => wingSpeffz.indexOf(speffz);
const indexToWingSpeffz = (index: number) => wingSpeffz[index];

const cornerSpeffzToIndex = (speffz: string) => cornerSpeffz.indexOf(speffz);
const indexToCornerSpeffz = (index: number) => cornerSpeffz[index];

let edgeBuffer: string = "C";
let wingBuffer: string = "C";
let cornerBuffer: string = "C";

function nextScramble() {
    const puzzleSize = cube.getLayerCount();

    const scramble = Scramble.randomMove(puzzleSize);
    scrambleOutput.textContent = scramble;

    cube.solve();
    cube.execute(Alg.fromString(scramble));
    cube.html(cubeContainer);

    generateMemo();
}

function generateMemo() {
    const puzzleSize = cube.getLayerCount();
    
    // Corners
    const cornerBufferIndex = cornerSpeffzToIndex(cornerBuffer);
    assert(cornerBufferIndex !== -1);

    const cornerCycleBreakOrder: number[] = [0, 3, 6, 9, 12, 15, 18, 21];
    const cornerMemoIndices = cube.memoCorners(cornerBufferIndex, cornerCycleBreakOrder);
    const cornerMemo = cornerMemoIndices.map(indexToCornerSpeffz);

    cornerMemoOutput.textContent = group(cornerMemo, 2);

    // Edges/Midges
    if (puzzleSize % 2 === 1) {
        const edgeBufferIndex = edgeSpeffzToIndex(edgeBuffer);
        assert(edgeBufferIndex !== -1);

        const edgeCycleBreakOrder: number[] = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
        const edgeMemoIndices = cube.memoEdges(edgeBufferIndex, edgeCycleBreakOrder);
        const edgeMemo = edgeMemoIndices.map(indexToEdgeSpeffz);

        edgeMemoOutput.textContent = group(edgeMemo, 2);
        edgeMemoLabel.style.display = "";
        edgeMemoOutput.style.display = "";
    } else {
        edgeMemoLabel.style.display = "none";
        edgeMemoOutput.style.display = "none";
    }

    // Wings
    if (puzzleSize > 3) {
        const wingBufferIndex = wingSpeffzToIndex(wingBuffer);
        assert(wingBufferIndex !== -1);

        const wingCycleBreakOrder: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
        const wingMemoIndices = cube.memoWings(1, wingBufferIndex, wingCycleBreakOrder);
        const wingMemo = wingMemoIndices.map(indexToWingSpeffz);

        wingMemoOutput.textContent = group(wingMemo, 2);
        wingMemoLabel.style.display = "";
        wingMemoOutput.style.display = "";
    } else {
        wingMemoLabel.style.display = "none";
        wingMemoOutput.style.display = "none";
    }

    // TODO: x centers and + centers
}

nextScrambleButton.addEventListener("click", nextScramble);

const puzzleSelect = document.getElementById("puzzle-select") as HTMLSelectElement;
puzzleSelect.addEventListener("change", () => {
    const puzzleSize = Number(puzzleSelect.value);
    if (puzzleSize < 2 || puzzleSize > 7) {
        return;
    }

    cube = new Cube(puzzleSize);
    nextScramble();
});

const edgeBufferInput = document.getElementById("edge-buffer") as HTMLInputElement;
edgeBufferInput.addEventListener("change", () => {
    let newEdgeBuffer = edgeBufferInput.value.toUpperCase();
    if (newEdgeBuffer.length !== 1 || edgeSpeffzToIndex(newEdgeBuffer) === -1) {
        edgeBufferInput.value = edgeBuffer;
        return;
    }
    edgeBuffer = newEdgeBuffer;
    edgeBufferInput.value = newEdgeBuffer;
    generateMemo();
});

const wingBufferInput = document.getElementById("wing-buffer") as HTMLInputElement;
wingBufferInput.addEventListener("change", () => {
    let newWingBuffer = wingBufferInput.value.toUpperCase();
    if (newWingBuffer.length !== 1 || wingSpeffzToIndex(newWingBuffer) === -1) {
        wingBufferInput.value = wingBuffer;
        return;
    }
    wingBuffer = newWingBuffer;
    wingBufferInput.value = newWingBuffer;
    generateMemo();
});

const cornerBufferInput = document.getElementById("corner-buffer") as HTMLInputElement;
cornerBufferInput.addEventListener("change", () => {
    let newCornerBuffer = cornerBufferInput.value.toUpperCase();
    if (newCornerBuffer.length !== 1 || cornerSpeffzToIndex(newCornerBuffer) === -1) {
        cornerBufferInput.value = cornerBuffer;
        return;
    }
    cornerBuffer = newCornerBuffer;
    cornerBufferInput.value = newCornerBuffer;
    generateMemo();
});

nextScramble();