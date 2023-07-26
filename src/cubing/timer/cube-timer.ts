export function forceDigitCount(num: number, numDigits: number): string {
    let str = num.toString();

    if (str.length >= numDigits) {
        return str;
    }

    return Array(numDigits - str.length).fill("0").join("") + str;
};

export function timeToString(millis: number, numDecimalPoints: number = 3): string {
    const signString = (millis < 0) ? "-" : "";
    millis = Math.abs(millis);

    const MILLIS_PER_HOUR = 3_600_000;
    const MILLIS_PER_MINUTE = 60_000;
    const MILLIS_PER_SECOND = 1_000;

    const hours = Math.floor(millis / MILLIS_PER_HOUR);
    millis -= hours * MILLIS_PER_HOUR;

    const minutes = Math.floor(millis / MILLIS_PER_MINUTE);
    millis -= minutes * MILLIS_PER_MINUTE;

    let seconds = Math.floor(millis / MILLIS_PER_SECOND);
    millis -= seconds * MILLIS_PER_SECOND;

    // Round up seconds if no decimal points are displayed
    if (numDecimalPoints === 0 && millis > 0 && signString !== "-") {
        seconds++;
    }

    let decimals: string;
    if (numDecimalPoints === 0) {
        decimals = "";
    } else {
        decimals = "." + forceDigitCount(millis, 3).slice(0, numDecimalPoints);
    }

    if (hours > 0) {
        return `${signString}${hours}:${forceDigitCount(minutes, 2)}:${forceDigitCount(seconds, 2)}${decimals}`;
    }
    if (minutes > 0) {
        return `${signString}${minutes}:${forceDigitCount(seconds, 2)}${decimals}`;
    }
    return `${signString}${seconds}${decimals}`;
}

export class CubeTimer {
    public resultType: "okay" | "+2" | "dnf";

    public useInspection: boolean;
    public inspectionTimeMillis: number;
    public timerDecimalPoints: number;
    public inspectionDecimalPoints: number;

    public timeMillis: number;

    private _startTime: DOMHighResTimeStamp;
    private _inspectionTimeUsed: number;

    private _timerIdle: boolean;
    private _isInInspection: boolean;
    private _isTiming: boolean;

    private _finishedTiming: boolean;

    private _timerIsDown: boolean;

    constructor() {
        this.resultType = "okay";

        this.useInspection = true;
        this.inspectionTimeMillis = 15000;
        this.timerDecimalPoints = 2;
        this.inspectionDecimalPoints = 0;

        this.timeMillis = 0;

        this._startTime = 0;
        this._inspectionTimeUsed = 0;

        this._timerIdle = true;
        this._isInInspection = false;
        this._isTiming = false;

        this._finishedTiming = false;

        this._timerIsDown = false;
    }

    timerDown(): void {
        if (this._isTiming) {
            this._endTimer();
            this._finishedTiming = true;
            return;
        }

        this._timerIsDown = true;
    }
    timerUp(): void {
        this._timerIsDown = false;

        if (this._finishedTiming) {
            this._finishedTiming = false;
            return;
        }

        if (this.useInspection) {
            if (this._timerIdle) {
                this._enterInspection();
                return;
            }
            if (this._isInInspection) {
                this._leaveInspection();
            }
        }

        if (!this._isTiming) {
            this._startTimer();
            return;
        }
    }

    update(node: HTMLElement): void {
        node.classList.remove("inspection", "timing", "down", "finished");

        const timeMillis = performance.now() - this._startTime;

        let display: string;
        if (this._isInInspection) {
            node.classList.add("inspection");

            const inspectionLeft = this.inspectionTimeMillis - timeMillis;
            if (inspectionLeft >= 0) {
                display = timeToString(inspectionLeft, this.inspectionDecimalPoints);
            }
            else if (inspectionLeft >= -2000) {
                display = "+2";
            }
            else {
                display = "DNF";
            }
        }
        else if (this._isTiming) {
            node.classList.add("timing");
            display = timeToString(timeMillis);
        }
        else {
            display = timeToString(this.timeMillis, this.timerDecimalPoints);
        }
        node.textContent = display;

        if (this._timerIsDown) {
            node.classList.add("down");
        }
        if (this._finishedTiming) {
            node.classList.add("finished");
        }
    }

    private _enterInspection(): void {
        this._timerIdle = false;
        this._isInInspection = true;
        this._isTiming = false;

        this._startTime = performance.now();
    }
    private _leaveInspection(): void {
        this._timerIdle = false;
        this._isInInspection = false;
        this._isTiming = false;

        this._inspectionTimeUsed = performance.now() - this._startTime;
    }
    private _startTimer(): void {
        this._timerIdle = false;
        this._isInInspection = false;
        this._isTiming = true;

        this._startTime = performance.now();
    }
    private _endTimer(): void {
        this._timerIdle = true;
        this._isInInspection = false;
        this._isTiming = false;

        this.timeMillis = performance.now() - this._startTime;

        if (this.useInspection) {
            const inspectionLeft = this.inspectionTimeMillis - this._inspectionTimeUsed;
            if (inspectionLeft >= 0) {
                this.resultType = "okay";
            }
            else if (inspectionLeft >= -2000) {
                this.resultType = "+2";
            }
            else {
                this.resultType = "dnf";
            }
        }
    }
}