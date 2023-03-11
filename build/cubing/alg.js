export class Move {
    constructor(move) {
        this.move = move;
    }
    name() {
        return this.move.replace("'", "i");
    }
    toString() {
        return this.move;
    }
    reversed() {
        switch (this.move[1]) {
            case "'":
                return new Move(this.move[0]);
            case "2":
                return new Move(this.move);
            default:
                return new Move(this.move + "'");
        }
    }
    static fromString(str) {
        let array = str.split(" ");
        let moves = [];
        for (const str of array) {
            moves.push(new Move(str));
        }
        return moves;
    }
}
export class Alg {
    constructor(alg) {
        this.moves = Move.fromString(alg);
        this.index = -1;
    }
    get length() {
        return this.moves.length;
    }
    toBeginning() {
        this.index = -1;
    }
    next() {
        return this.moves[++this.index].name();
    }
    prev() {
        return this.moves[--this.index].name();
    }
    same() {
        return this.moves[this.index].name();
    }
    copy() {
        return new Alg(this.toString());
    }
    reverse() {
        let numMoves = this.moves.length;
        let moveCopies = Array(numMoves);
        for (let i = 0; i < numMoves; i++) {
            moveCopies[i] = this.moves[i];
        }
        for (let i = 0; i < numMoves; i++) {
            this.moves[numMoves - i - 1] = moveCopies[i].reversed();
        }
        return this;
    }
    toString() {
        let stringArray = Array(this.moves.length);
        for (let i = 0; i < this.moves.length; i++) {
            stringArray.push(this.moves[i].toString());
        }
        return stringArray.join(" ");
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
        return new Alg(moves.join(" "));
    }
    static fromAlgs(...algs) {
        const strArray = Array(algs.length);
        for (let i = 0; i < algs.length; i++) {
            strArray[i] = algs[i].toString();
        }
        return new Alg(strArray.join(" :-: "));
    }
}
