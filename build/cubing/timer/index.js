import { SessionDB } from "./solve-db.js";
import { TimeTable } from "./time-table.js";
import { Mean } from "./time-stat.js";
const timerInput = document.getElementById("timer-input");
const timerDiv = document.getElementById("timer");
timerDiv.style.display = "none";
const timeTable = new TimeTable(document.querySelector(".time-table"), new Mean(3));
let currentSession = await SessionDB.load("3x3");
await timeTable.loadSession(currentSession);
timerInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        const solve = {
            time: Number.parseFloat(timerInput.value),
            scramble: ""
        };
        currentSession.addSolve(solve);
        timeTable.addSolveRowAbove(solve, currentSession.solveCount);
        timerInput.value = "";
    }
});
