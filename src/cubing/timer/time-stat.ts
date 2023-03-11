export class Mean {
    public n: number;

    private times: number[];
    private acc: number = 0;

    constructor(n: number) {
        this.n = n;
        this.times = [];
    }

    nextTime(time: number): number {
        this.acc += time;
        this.times.push(time);
        if (this.times.length < this.n) {
            return NaN;
        }
        let mean = this.acc / this.n;
        this.acc -= this.times.shift() as number;
        return mean;
    }
    current(): number {
        return this.acc / this.n;
    }
    reset() {
        this.times = [];
        this.acc = 0;
    }
}
export class Average {
    public n: number;

    constructor(n: number) {
        this.n = n;
    }

    nextTime(time: number): number {
        return NaN;
    }
    current(): number {
        return NaN;
    }
    reset() {
        
    }
}
export type TimeStat = Mean | Average;