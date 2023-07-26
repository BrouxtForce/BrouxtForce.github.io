import { CubeTimer } from "./cube-timer.js";
const timerNode = document.querySelector(".time");
const cubeTimer = new CubeTimer();
document.body.addEventListener("keydown", event => {
    if (!event.repeat) {
        if (event.key === " ") {
            cubeTimer.timerDown();
        }
    }
});
document.body.addEventListener("keyup", event => {
    if (event.key === " ") {
        cubeTimer.timerUp();
    }
});
const loop = () => {
    cubeTimer.update(timerNode);
    requestAnimationFrame(loop);
};
loop();
