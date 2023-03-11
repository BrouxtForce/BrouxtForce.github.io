var CubeTimerPhase;
(function (CubeTimerPhase) {
    CubeTimerPhase[CubeTimerPhase["Idle"] = 0] = "Idle";
    CubeTimerPhase[CubeTimerPhase["InspectionTimerDown"] = 1] = "InspectionTimerDown";
    CubeTimerPhase[CubeTimerPhase["Inspection"] = 2] = "Inspection";
    CubeTimerPhase[CubeTimerPhase["TimerDown"] = 3] = "TimerDown";
    CubeTimerPhase[CubeTimerPhase["TimerActive"] = 4] = "TimerActive";
    CubeTimerPhase[CubeTimerPhase["TimerStop"] = 5] = "TimerStop";
})(CubeTimerPhase || (CubeTimerPhase = {}));
export class CubeTimer {
    constructor(displayNode) {
        this.startTime = 0;
        this.inspectionStartTime = 0;
        this.fixed = 2;
        this.displayNode = displayNode;
        this.phase = CubeTimerPhase.Idle;
        this.update();
    }
    updateDisplay(millis) {
        this.displayNode.textContent = (millis / 1000).toFixed(this.fixed);
    }
    leavePhase() {
        switch (this.phase) {
            case CubeTimerPhase.Idle:
                this.displayNode.classList.remove("stop");
                break;
            case CubeTimerPhase.InspectionTimerDown:
                break;
            case CubeTimerPhase.Inspection:
                this.displayNode.classList.remove("down");
                break;
            case CubeTimerPhase.TimerDown:
                this.displayNode.classList.remove("inspection");
                break;
            case CubeTimerPhase.TimerActive:
                this.displayNode.classList.remove("down");
                break;
            case CubeTimerPhase.TimerStop:
                this.displayNode.classList.remove("active");
                break;
        }
    }
    enterPhase() {
        switch (this.phase) {
            case CubeTimerPhase.Idle:
                break;
            case CubeTimerPhase.InspectionTimerDown:
                this.displayNode.classList.add("down");
                break;
            case CubeTimerPhase.Inspection:
                this.inspectionStartTime = performance.now();
                this.displayNode.classList.add("inspection");
                break;
            case CubeTimerPhase.TimerDown:
                this.displayNode.classList.add("down");
                break;
            case CubeTimerPhase.TimerActive:
                this.startTime = performance.now();
                this.displayNode.classList.add("active");
                break;
            case CubeTimerPhase.TimerStop:
                this.updateDisplay(0);
                this.displayNode.classList.add("stop");
                break;
        }
    }
    nextPhase() {
        this.leavePhase();
        this.phase = (this.phase + 1) % 5;
        this.enterPhase();
    }
    update() {
        switch (this.phase) {
            case CubeTimerPhase.Inspection:
            case CubeTimerPhase.TimerDown:
                this.updateDisplay(15000 - (performance.now() - this.inspectionStartTime));
                break;
            case CubeTimerPhase.TimerActive:
                this.updateDisplay(performance.now() - this.startTime);
                break;
        }
        window.requestAnimationFrame(this.update.bind(this));
    }
    timerDown() {
        switch (this.phase) {
            case CubeTimerPhase.InspectionTimerDown - 1:
            case CubeTimerPhase.TimerDown - 1:
            case CubeTimerPhase.TimerActive:
                this.nextPhase();
                break;
        }
    }
    timerUp() {
        switch (this.phase) {
            case CubeTimerPhase.InspectionTimerDown:
            case CubeTimerPhase.TimerDown:
                this.nextPhase();
                break;
        }
    }
}
