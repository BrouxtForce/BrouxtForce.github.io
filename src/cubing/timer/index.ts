import { CubeTimer } from "./cube-timer.js";
import { ReconDB, SessionDB } from "./solve-db.js";
import { TimeTable } from "./time-table.js";
import { Mean } from "./time-stat.js";

const timerInput = document.getElementById("timer-input") as HTMLInputElement;
const timerDiv = document.getElementById("timer") as HTMLDivElement;
timerDiv.style.display = "none";

const timeTable = new TimeTable(document.querySelector(".time-table") as HTMLTableElement, new Mean(3));
let currentSession = await SessionDB.load("3x3");
await timeTable.loadSession(currentSession);

timerInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        const solve = {
            time: Number.parseFloat(timerInput.value),
            scramble: ""
        }
        currentSession.addSolve(solve);
        timeTable.addSolveRowAbove(solve, currentSession.solveCount);
        timerInput.value = "";
    }
});

// timeTable.addSolveRow({ time: 1.01, scramble: "" }, 1);
// timeTable.addSolveRow({ time: 1.02, scramble: "" }, 2);
// timeTable.addSolveRow({ time: 1.03, scramble: "" }, 3);
// timeTable.addSolveRow({ time: 1.04, scramble: "" }, 4);

// const cubeTimer = new CubeTimer(timerDiv);

// document.body.addEventListener("keydown", event => {
//     if (!event.repeat) {
//         if (event.key === " ") {
//             cubeTimer.timerDown();
//         }
//     }
// });
// document.body.addEventListener("keyup", event => {
//     if (event.key === " ") {
//         cubeTimer.timerUp();
//     }
// });


