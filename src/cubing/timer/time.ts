export namespace Time {
    export function formatMillis(millis: number): string {
        let days         = Math.floor(millis / 86_400_000);
        let hours        = Math.floor(millis / 3_600_000 ) % 24;
        let minutes      = Math.floor(millis / 60_000    ) % 60;
        let seconds      = Math.floor(millis / 1_000     ) % 60;
        let milliseconds = Math.floor(millis             ) % 1000;

        let times = [days, hours, minutes, seconds];
        while (times[0] === 0 && times.length > 1) {
            times.shift();
        }

        return `${times.join(":")}.${milliseconds.toString()}`;
    }
}
