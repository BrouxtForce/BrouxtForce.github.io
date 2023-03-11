import { Alg } from "./alg.js";
export var Scramble;
(function (Scramble) {
    let Cube444;
    (function (Cube444) {
        Cube444.randomMove = function (length) {
            let moves = [];
            let prevMove = [NaN, NaN, NaN];
            let parallel = false;
            let moveSet = [
                [["U", "U'", "U2"], ["D", "D'", "D2"]],
                [["L", "L'", "L2"], ["R", "R'", "R2"]],
                [["F", "F'", "F2"], ["B", "B'", "B2"]]
            ];
            for (let i = 0; i < length; i++) {
                while (true) {
                    let index_0 = Math.floor(Math.random() * 3);
                    let index_1 = Math.floor(Math.random() * 2);
                    if (index_0 === prevMove[0] && (index_1 === prevMove[1] || parallel))
                        continue;
                    let index_2 = Math.floor(Math.random() * 3);
                    moves.push(moveSet[index_0][index_1][index_2]);
                    prevMove[0] = index_0;
                    prevMove[1] = index_1;
                    prevMove[2] = index_2;
                    parallel = index_0 === prevMove[0];
                    break;
                }
            }
            for (let i = 0; i < moves.length; i++) {
                if (Math.random() < 0.5) {
                    moves[i] = moves[i].toLowerCase();
                }
            }
            return new Alg(moves.join(" "));
        };
        Cube444.centersOnly = function (length) {
            let scramble = Cube444.randomMove(length);
            let supercubeAlg = new Alg("L2 D U B F D' U' R2 B F D U B' F'");
            let reversedScramble = scramble.copy().reverse();
            return Alg.fromAlgs(scramble, supercubeAlg, reversedScramble);
        };
    })(Cube444 = Scramble.Cube444 || (Scramble.Cube444 = {}));
})(Scramble || (Scramble = {}));
