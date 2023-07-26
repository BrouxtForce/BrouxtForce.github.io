export function forceDigitCount(num, numDigits) {
    let str = num.toString();
    if (str.length >= numDigits) {
        return str;
    }
    return Array(numDigits - str.length).fill("0").join("") + str;
}
;
export function timeToString(millis, numDecimalPoints = 3) {
    const signString = (millis < 0) ? "-" : "";
    millis = Math.abs(millis);
    const MILLIS_PER_HOUR = 3600000;
    const MILLIS_PER_MINUTE = 60000;
    const MILLIS_PER_SECOND = 1000;
    const hours = Math.floor(millis / MILLIS_PER_HOUR);
    millis -= hours * MILLIS_PER_HOUR;
    const minutes = Math.floor(millis / MILLIS_PER_MINUTE);
    millis -= minutes * MILLIS_PER_MINUTE;
    let seconds = Math.floor(millis / MILLIS_PER_SECOND);
    millis -= seconds * MILLIS_PER_SECOND;
    if (numDecimalPoints === 0 && millis > 0 && signString !== "-") {
        seconds++;
    }
    let decimals;
    if (numDecimalPoints === 0) {
        decimals = "";
    }
    else {
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
    timerDown() {
        if (this._isTiming) {
            this._endTimer();
            this._finishedTiming = true;
            return;
        }
        this._timerIsDown = true;
    }
    timerUp() {
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
    update(node) {
        node.classList.remove("inspection", "timing", "down", "finished");
        const timeMillis = performance.now() - this._startTime;
        let display;
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
    _enterInspection() {
        this._timerIdle = false;
        this._isInInspection = true;
        this._isTiming = false;
        this._startTime = performance.now();
    }
    _leaveInspection() {
        this._timerIdle = false;
        this._isInInspection = false;
        this._isTiming = false;
        this._inspectionTimeUsed = performance.now() - this._startTime;
    }
    _startTimer() {
        this._timerIdle = false;
        this._isInInspection = false;
        this._isTiming = true;
        this._startTime = performance.now();
    }
    _endTimer() {
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
