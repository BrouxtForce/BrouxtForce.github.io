import { Cube } from "./cube/cube.js";
import { Alg } from "./cube/alg.js";
import { Scramble } from "./scramble.js";
const cubeContainer = document.getElementById("cube-container");
const nextScrambleButton = document.getElementById("next-scramble");
const scrambleOutput = document.getElementById("scramble");
const edgeMemoOutput = document.getElementById("edge-memo");
const cornerMemoOutput = document.getElementById("corner-memo");
const cube = new Cube(3);
const group = function (array, amount) {
    const grouped = [];
    for (let i = 0; i < array.length; i += 2) {
        grouped.push(array[i] + (array[i + 1] ?? ""));
    }
    return grouped.join(" ");
};
const nextScramble = function () {
    const scramble = Scramble.randomMove(3, 20);
    scrambleOutput.textContent = scramble;
    cube.solve();
    cube.execute(Alg.fromString(scramble));
    cube.html(cubeContainer);
    const edgeCycleBreakOrder = [0, 2, 6, 8, 10, 12, 14, 16, 18, 20, 22];
    const edgeMemoIndices = cube.memoEdges(4, edgeCycleBreakOrder);
    const edgeMemo = edgeMemoIndices.map(val => "AQBMCIDEJPLFRHTNUKVOWSXG"[val]);
    edgeMemoOutput.textContent = group(edgeMemo, 2);
    const cornerCycleBreakOrder = [0, 3, 9, 12, 15, 18, 21];
    const cornerMemoIndices = cube.memoCorners(6, cornerCycleBreakOrder);
    const cornerMemo = cornerMemoIndices.map(val => "AERBQNCMJDIFUGLVKPWOTXSH"[val]);
    cornerMemoOutput.textContent = group(cornerMemo, 2);
};
nextScrambleButton.addEventListener("click", nextScramble);
nextScramble();
