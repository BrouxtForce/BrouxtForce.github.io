enum CubeTimerPhase {
    Idle = 0,
    InspectionTimerDown,
    Inspection,
    TimerDown,
    TimerActive,
    TimerStop
}

export class CubeTimer {
    private startTime: DOMHighResTimeStamp = 0;
    private inspectionStartTime: DOMHighResTimeStamp = 0;
    private displayNode: HTMLElement;
    private phase: CubeTimerPhase;
    private fixed: number = 2;

    constructor(displayNode: HTMLElement) {
        this.displayNode = displayNode;
        this.phase = CubeTimerPhase.Idle;

        // Start update loop
        this.update();
    }

    // private numString(num: number): string {
    //     return num.toFixed(this.fixed / 1000);
    // }
    private updateDisplay(millis: number): void {
        this.displayNode.textContent = (millis / 1000).toFixed(this.fixed);
    }
    private leavePhase(): void {
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
    private enterPhase(): void {
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
    private nextPhase(): void {
        this.leavePhase();
        this.phase = (this.phase + 1) % 5;
        this.enterPhase();
    }
    private update(): void {
        switch (this.phase) {
            case CubeTimerPhase.Inspection:
            case CubeTimerPhase.TimerDown:
                // this.displayNode.textContent = this.numString(performance.now() - this.inspectionStartTime);
                this.updateDisplay(15000 - (performance.now() - this.inspectionStartTime));
                break;

            case CubeTimerPhase.TimerActive:
                // this.displayNode.textContent = this.numString(performance.now() - this.startTime);
                this.updateDisplay(performance.now() - this.startTime);
                break;
        }
        window.requestAnimationFrame(this.update.bind(this));
    }

    timerDown(): void {
        switch (this.phase) {
            case CubeTimerPhase.InspectionTimerDown - 1:
            case CubeTimerPhase.TimerDown - 1:
            case CubeTimerPhase.TimerActive:
                this.nextPhase();
                break;
        }
    }
    timerUp(): void {
        switch (this.phase) {
            case CubeTimerPhase.InspectionTimerDown:
            case CubeTimerPhase.TimerDown:
                this.nextPhase();
                break;
        }
    }
}