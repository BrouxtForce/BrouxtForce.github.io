/*

SiGN notation: https://mzrg.com/rubik/nota.shtml

*/

class Alg {
    constructor(string) {
        this.string = string;
        this.array = string.split(" ");
        this.length = this.array.length;
        this._inverseCharacter = "'";
        this.index = 0;
    }
    set inverseCharacter(char) {
        // TODO: Update this.string
        for (let i = 0; i < this.array.length; i++) {
            this.array[i] = this.array[i].replace(this._inverseCharacter, char);
        }
        this._inverseCharacter = char;
    }
    get inverseCharacter() {
        return this._inverseCharacter;
    }
    toBeginning() {
        this.index = 0;
    }
    next() {
        return this.array[this.index++];
    }
    prev() {
        return this.array[--this.index - 1];
    }
    same() {
        return this.array[this.index - 1]; // Because this.index gets incremented after calling alg.next()
    }
    toString() {
        return this.string;
    }

    static randomScramble(length) {
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
                if (index_0 === prevMove[0] && (index_1 === prevMove[1] || parallel)) continue;
                let index_2 = Math.floor(Math.random() * 3);
                moves.push(moveSet[index_0][index_1][index_2]);
                prevMove[0] = index_0;
                prevMove[1] = index_1;
                prevMove[2] = index_2;
                parallel = index_0 === prevMove[0];
                break;
            }
        }
        return new Alg(moves.join(" "));
    }

    // static randInt(lowInc, highEx) {
    //     return lowInc + Math.floor(Math.random() * (highEx - lowInc));
    // }
}