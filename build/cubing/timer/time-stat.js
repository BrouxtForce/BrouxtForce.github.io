export class Mean {
    constructor(n) {
        this.acc = 0;
        this.n = n;
        this.times = [];
    }
    nextTime(time) {
        this.acc += time;
        this.times.push(time);
        if (this.times.length < this.n) {
            return NaN;
        }
        let mean = this.acc / this.n;
        this.acc -= this.times.shift();
        return mean;
    }
    current() {
        return this.acc / this.n;
    }
    reset() {
        this.times = [];
        this.acc = 0;
    }
}
export class Average {
    constructor(n) {
        this.n = n;
    }
    nextTime(time) {
        return NaN;
    }
    current() {
        return NaN;
    }
    reset() {
    }
}
