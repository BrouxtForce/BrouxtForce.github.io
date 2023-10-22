import { Cube } from "./cube/cube.js";
import { Alg } from "./cube/alg.js";
import { Scramble } from "./scramble.js";

const cubeContainer = document.getElementById("cube-container") as HTMLElement;
const nextScrambleButton = document.getElementById("next-scramble") as HTMLElement;
const scrambleOutput = document.getElementById("scramble") as HTMLElement;
const edgeMemoOutput = document.getElementById("edge-memo") as HTMLElement;
const cornerMemoOutput = document.getElementById("corner-memo") as HTMLElement;

const cube = new Cube(3);

const group = function(array: string[], amount: number): string {
    const grouped: string[] = [];
    for (let i = 0; i < array.length; i += 2) {
        grouped.push(array[i] + (array[i + 1] ?? ""));
    }
    return grouped.join(" ");
};

const nextScramble = function() {
    const scramble = Scramble.randomMove(3, 20);
    scrambleOutput.textContent = scramble;

    cube.solve();
    cube.execute(Alg.fromString(scramble));
    cube.html(cubeContainer);

    const edgeCycleBreakOrder: number[] = [0, 2, 6, 8, 10, 12, 14, 16, 18, 20, 22];
    const edgeMemoIndices = cube.memoEdges(4, edgeCycleBreakOrder);
    const edgeMemo = edgeMemoIndices.map(val => "AQBMCIDEJPLFRHTNUKVOWSXG"[val]);
    edgeMemoOutput.textContent = group(edgeMemo, 2);

    const cornerCycleBreakOrder: number[] = [0, 3, 9, 12, 15, 18, 21];
    const cornerMemoIndices = cube.memoCorners(6, cornerCycleBreakOrder);
    const cornerMemo = cornerMemoIndices.map(val => "AERBQNCMJDIFUGLVKPWOTXSH"[val]);
    cornerMemoOutput.textContent = group(cornerMemo, 2);
};

nextScrambleButton.addEventListener("click", nextScramble);

nextScramble();