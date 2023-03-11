export var Time;
(function (Time) {
    function formatMillis(millis) {
        let days = Math.floor(millis / 86400000);
        let hours = Math.floor(millis / 3600000) % 24;
        let minutes = Math.floor(millis / 60000) % 60;
        let seconds = Math.floor(millis / 1000) % 60;
        let milliseconds = Math.floor(millis) % 1000;
        let times = [days, hours, minutes, seconds];
        while (times[0] === 0 && times.length > 1) {
            times.shift();
        }
        return `${times.join(":")}.${milliseconds.toString()}`;
    }
    Time.formatMillis = formatMillis;
})(Time || (Time = {}));
