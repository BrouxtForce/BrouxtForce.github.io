import { forceDigitCount, timeToString, CubeTimer } from "../../../src/cubing/timer/cube-timer";

describe("forceDigitCount() tests", () => {
    test("A number with the same or more number of specified digits should only call .toString()", () => {
        const testNumbers = [369, 257, 110, 610, 193, 903, 837, 390, 342, 113];

        for (const num of testNumbers) {
            expect(forceDigitCount(num, 2)).toBe(num.toString());
        }
    });

    test("A number with less than the number of specified digits should always be the same length", () => {
        const testNumbers = [460, 4402, 39029, 837560, 7360702];

        for (const num of testNumbers) {
            expect(forceDigitCount(num, 10).length).toBe(10);
        }
    })
});

describe("timeToString() tests", () => {
    const getMillis = function(hours: number, minutes: number, seconds: number, millis: number): number {
        const MILLIS_PER_HOUR = 3_600_000;
        const MILLIS_PER_MINUTE = 60_000;
        const MILLIS_PER_SECOND = 1_000;

        return hours * MILLIS_PER_HOUR +
               minutes * MILLIS_PER_MINUTE +
               seconds * MILLIS_PER_SECOND +
               millis;
    }

    test("hours:minutes:seconds.milliseconds", () => {
        expect(timeToString(getMillis(32, 46, 6, 403), 3)).toBe("32:46:06.403");
        expect(timeToString(-getMillis(32, 46, 6, 403), 3)).toBe("-32:46:06.403");
        expect(timeToString(getMillis(32, 46, 6, 0), 3)).toBe("32:46:06.000");
        expect(timeToString(-getMillis(32, 46, 6, 0), 3)).toBe("-32:46:06.000");
    });

    test("hours:minutes:seconds", () => {
        expect(timeToString(getMillis(32, 46, 6, 403), 0)).toBe("32:46:07");
        expect(timeToString(-getMillis(32, 46, 6, 403), 0)).toBe("-32:46:06");
    });

    test("minutes:seconds.milliseconds", () => {
        expect(timeToString(getMillis(0, 54, 22, 227), 3)).toBe("54:22.227");
        expect(timeToString(-getMillis(0, 54, 22, 227), 3)).toBe("-54:22.227");
        expect(timeToString(getMillis(0, 54, 22, 0), 3)).toBe("54:22.000");
        expect(timeToString(-getMillis(0, 54, 22, 0), 3)).toBe("-54:22.000");
    });

    test("minutes:seconds", () => {
        expect(timeToString(getMillis(0, 54, 22, 227), 0)).toBe("54:23");
        expect(timeToString(-getMillis(0, 54, 22, 227), 0)).toBe("-54:22");
    });

    test("seconds.milliseconds", () => {
        expect(timeToString(getMillis(0, 0, 55, 247), 3)).toBe("55.247");
        expect(timeToString(-getMillis(0, 0, 55, 247), 3)).toBe("-55.247");
        expect(timeToString(getMillis(0, 0, 55, 0), 3)).toBe("55.000");
        expect(timeToString(-getMillis(0, 0, 55, 0), 3)).toBe("-55.000");
    });

    test("seconds", () => {
        expect(timeToString(getMillis(0, 0, 55, 247), 0)).toBe("56");
        expect(timeToString(-getMillis(0, 0, 55, 247), 0)).toBe("-55");
    });
});