import { TrainerConfig } from "./trainer-config.js";
import { Alg } from "./alg.js";

String.prototype.divideIntoChars = function() {
    const array = [];
    for (let i = 0; i < this.length; i++) {
        array[i] = this[i];
    }
    return array;
};

class CubeEdges {
    constructor(edges = CubeEdges.solvedState) {
        this.stateFromRaw = [];
        this.stateToRaw = [];
        let solvedState = CubeEdges.solvedState;
        let solvedStateRaw = CubeEdges.solvedStateRaw;
        for (let i = 0; i < solvedState.length; i++) {
            for (let j = 0; j < solvedStateRaw.length; j++) {
                if (solvedState[i] === solvedStateRaw[j]) {
                    this.stateFromRaw[j] = i;
                    this.stateToRaw[i] = j;
                    break;
                }
            }
        }

        this.OriLtrToIndex = {
            A: 0, B: 1, C: 2, D: 3, J: 4, L: 5, R: 6, T: 7, U: 8, V: 9, W: 10, X: 11
        };
        this.IndexToOriLtr = [];
        for (let key in this.OriLtrToIndex) {
            this.IndexToOriLtr[this.OriLtrToIndex[key]] = key;
        }

        this.LetterToIndex = {
            A: 0,  Q: 1,  B: 2,  M: 3,  C: 4,  I: 5,  D: 6,  E: 7,  J: 8,  P: 9,  L: 10, F: 11,
            R: 12, H: 13, T: 14, N: 15, U: 16, K: 17, V: 18, O: 19, W: 20, S: 21, X: 22, G: 23
        };
        this.IndexToLetter = [];
        for (let key in this.LetterToIndex) {
            this.IndexToLetter[this.LetterToIndex[key]] = key;
        }

        this.state = edges;
    }
    set state(string) {
        let stringArr = [];
        for (let i = 0; i < string.length; i++) {
            stringArr[this.stateToRaw[i]] = string[i];
        }
        this.stateRaw = stringArr.join("");
    }
    get state() {
        let stringArr = [];
        let stringRaw = this.stateRaw;
        for (let i = 0; i < stringRaw.length; i++) {
            stringArr[this.stateFromRaw[i]] = stringRaw[i];
        }
        return stringArr.join("");
    }
    set stateRaw(string) {
        this._state = [];
        for (let i = 0; i < string.length; i += 2) {
            this._state.push([string[i], string[i + 1]]);
        }
    }
    get stateRaw() {
        let flatState = this._state.flat();
        return flatState.join("");
    }

    static get solvedStateRaw() { return "AQBMCIDEJPLFRHTNUKVOWSXG"; }
    static get solvedState() { return "ABCDEFGHIJKLMNOPQRSTUVWX"; }

    execute(alg) {
        alg.toBeginning();
        for (let i = 0; i < alg.length; i++) {
            this[alg.next()]();
        }
    }

    orientedLetter(letter) {
        let index = this.LetterToIndex[letter];
        index -= index % 2;
        return this.IndexToLetter[index];
    }
    compareLetters(letter_1, letter_2) {
        return this.orientedLetter(letter_1) === this.orientedLetter(letter_2);
    }
    getPiece(letter) {
        let solvedStateRaw = CubeEdges.solvedStateRaw;
        for (let i = 0; i < this._state.length; i++) {
            if (solvedStateRaw[i * 2] === letter) {
                return this._state[i][0];
            }
            if (solvedStateRaw[i * 2 + 1] === letter) {
                return this._state[i][1];
            }
        }
    }
    getSolvedPiecesArray() {
        let array = [];
        for (let i = 0; i < 12; i++) {
            if (this.getPiece(this._state[i][0]) === this._state[i][0]) {
                array.push(true);
            } else {
                array.push(false);
            }
        }
        return array;
    }
    trace(buffer) {
        let solvedPieces = this.getSolvedPiecesArray();
        solvedPieces[this.OriLtrToIndex[this.orientedLetter(buffer)]] = true;
        let target = this.getPiece(buffer);
        let cycleStart = buffer;
        let path = [];
        let loopProtector = 0;
        while (!solvedPieces.every(value => value)) {
            if (loopProtector++ > 100) {
                console.error("Infinite loop detected on edge tracing");
                return "";
            }

            if (this.compareLetters(target, cycleStart) || this.compareLetters(target, buffer)) {
                if (this.compareLetters(target, cycleStart) && !this.compareLetters(target, buffer)) {
                    solvedPieces[this.OriLtrToIndex[this.orientedLetter(cycleStart)]] = true;
                    path.push(target);
                }
                let found = false;
                for (let i = 0; i < solvedPieces.length; i++) {
                    if (!solvedPieces[i]) {
                        let letter = this.IndexToOriLtr[i];
                        cycleStart = letter;
                        target = letter;
                        found = true;
                        break;
                    }
                }
                if (found) {
                    path.push(target);
                    target = this.getPiece(target);
                }
                continue;
            }
            path.push(target);
            solvedPieces[this.OriLtrToIndex[this.orientedLetter(target)]] = true;
            target = this.getPiece(target);
            
        }
        return path;
    }

    swap(index_1, index_2) {
        let swap = this._state[index_1];
        this._state[index_1] = this._state[index_2];
        this._state[index_2] = swap;
    }
    cycle4(index_1, index_2, index_3, index_4) {
        let swap = this._state[index_1];
        this._state[index_1] = this._state[index_4];
        this._state[index_4] = this._state[index_3];
        this._state[index_3] = this._state[index_2];
        this._state[index_2] = swap;
    }
    cycle4i(index_1, index_2, index_3, index_4) {
        let swap = this._state[index_1];
        this._state[index_1] = this._state[index_2];
        this._state[index_2] = this._state[index_3];
        this._state[index_3] = this._state[index_4];
        this._state[index_4] = swap;
    }
    flip(index) {
        this._state[index].push(this._state[index].shift());
    }
    flip4(index_1, index_2, index_3, index_4) {
        this.flip(index_1);
        this.flip(index_2);
        this.flip(index_3);
        this.flip(index_4);
    }

    U() {
        this.cycle4(this.OriLtrToIndex.A, this.OriLtrToIndex.B, this.OriLtrToIndex.C, this.OriLtrToIndex.D);
    }
    F() {
        this.cycle4(this.OriLtrToIndex.C, this.OriLtrToIndex.J, this.OriLtrToIndex.U, this.OriLtrToIndex.L);
        this.flip4(this.OriLtrToIndex.C, this.OriLtrToIndex.J, this.OriLtrToIndex.U, this.OriLtrToIndex.L);
    }
    R() {
        this.cycle4(this.OriLtrToIndex.B, this.OriLtrToIndex.T, this.OriLtrToIndex.V, this.OriLtrToIndex.J);
    }
    B() {
        this.cycle4(this.OriLtrToIndex.A, this.OriLtrToIndex.R, this.OriLtrToIndex.W, this.OriLtrToIndex.T);
        this.flip4(this.OriLtrToIndex.A, this.OriLtrToIndex.R, this.OriLtrToIndex.W, this.OriLtrToIndex.T);
    }
    L() {
        this.cycle4(this.OriLtrToIndex.D, this.OriLtrToIndex.L, this.OriLtrToIndex.X, this.OriLtrToIndex.R);
    }
    D() {
        this.cycle4(this.OriLtrToIndex.U, this.OriLtrToIndex.V, this.OriLtrToIndex.W, this.OriLtrToIndex.X);
    }

    Ui() {
        this.cycle4i(this.OriLtrToIndex.A, this.OriLtrToIndex.B, this.OriLtrToIndex.C, this.OriLtrToIndex.D);
    }
    Fi() {
        this.cycle4i(this.OriLtrToIndex.C, this.OriLtrToIndex.J, this.OriLtrToIndex.U, this.OriLtrToIndex.L);
        this.flip4(this.OriLtrToIndex.C, this.OriLtrToIndex.J, this.OriLtrToIndex.U, this.OriLtrToIndex.L);
    }
    Ri() {
        this.cycle4i(this.OriLtrToIndex.B, this.OriLtrToIndex.T, this.OriLtrToIndex.V, this.OriLtrToIndex.J);
    }
    Bi() {
        this.cycle4i(this.OriLtrToIndex.A, this.OriLtrToIndex.R, this.OriLtrToIndex.W, this.OriLtrToIndex.T);
        this.flip4(this.OriLtrToIndex.A, this.OriLtrToIndex.R, this.OriLtrToIndex.W, this.OriLtrToIndex.T);
    }
    Li() {
        this.cycle4i(this.OriLtrToIndex.D, this.OriLtrToIndex.L, this.OriLtrToIndex.X, this.OriLtrToIndex.R);
    }
    Di() {
        this.cycle4i(this.OriLtrToIndex.U, this.OriLtrToIndex.V, this.OriLtrToIndex.W, this.OriLtrToIndex.X);
    }

    U2() {
        this.swap(this.OriLtrToIndex.A, this.OriLtrToIndex.C);
        this.swap(this.OriLtrToIndex.B, this.OriLtrToIndex.D);
    }
    F2() {
        this.swap(this.OriLtrToIndex.C, this.OriLtrToIndex.U);
        this.swap(this.OriLtrToIndex.J, this.OriLtrToIndex.L);
    }
    R2() {
        this.swap(this.OriLtrToIndex.B, this.OriLtrToIndex.V);
        this.swap(this.OriLtrToIndex.J, this.OriLtrToIndex.T);
    }
    B2() {
        this.swap(this.OriLtrToIndex.A, this.OriLtrToIndex.W);
        this.swap(this.OriLtrToIndex.R, this.OriLtrToIndex.T);
    }
    L2() {
        this.swap(this.OriLtrToIndex.D, this.OriLtrToIndex.X);
        this.swap(this.OriLtrToIndex.L, this.OriLtrToIndex.R);
    }
    D2() {
        this.swap(this.OriLtrToIndex.U, this.OriLtrToIndex.W);
        this.swap(this.OriLtrToIndex.V, this.OriLtrToIndex.X);
    }
}

class CubeCorners {
    constructor (corners = CubeCorners.solvedState) {
        this.stateFromRaw = [];
        this.stateToRaw = [];
        let solvedState = CubeCorners.solvedState;
        let solvedStateRaw = CubeCorners.solvedStateRaw;
        for (let i = 0; i < solvedState.length; i++) {
            for (let j = 0; j < solvedStateRaw.length; j++) {
                if (solvedState[i] === solvedStateRaw[j]) {
                    this.stateFromRaw[j] = i;
                    this.stateToRaw[i] = j;
                    break;
                }
            }
        }

        this.OriLtrToIndex = {
            A: 0, B: 1, C: 2, D: 3, U: 4, V: 5, W: 6, X: 7
        };
        this.IndexToOriLtr = [];
        for (let key in this.OriLtrToIndex) {
            this.IndexToOriLtr[this.OriLtrToIndex[key]] = key;
        }

        this.LetterToIndex = {
            A: 0,  E: 1,  R: 2,  B: 3,  Q: 4,  N: 5,  C: 6,  M: 7,  J: 8,  D: 9,  I: 10, F: 11,
            U: 12, G: 13, L: 14, V: 15, K: 16, P: 17, W: 18, O: 19, T: 20, X: 21, S: 22, H: 23
        };
        this.IndexToLetter = [];
        for (let key in this.LetterToIndex) {
            this.IndexToLetter[this.LetterToIndex[key]] = key;
        }

        this.state = corners;
    }
    set state(string) {
        let stringArr = [];
        for (let i = 0; i < string.length; i++) {
            stringArr[this.stateToRaw[i]] = string[i];
        }
        this.stateRaw = stringArr.join("");
    }
    get state() {
        let stringArr = [];
        let stringRaw = this.stateRaw;
        for (let i = 0; i < stringRaw.length; i++) {
            stringArr[this.stateFromRaw[i]] = stringRaw[i];
        }
        return stringArr.join("");
    }
    set stateRaw(string) {
        this._state = [];
        for (let i = 0; i < string.length; i += 3) {
            this._state.push([string[i], string[i + 1], string[i + 2]]);
        }
    }
    get stateRaw() {
        let flatState = this._state.flat();
        return flatState.join("");
    }

    static get solvedState() { return "ABCDEFGHIJKLMNOPQRSTUVWX"; }
    static get solvedStateRaw() { return "AERBQNCMJDIFUGLVKPWOTXSH"; }

    execute(alg) {
        alg.toBeginning();
        for (let i = 0; i < alg.length; i++) {
            let next = alg.next();
            if (next[1] === "i") {
                this[next[0]]();
                this[next[0]]();
                this[next[0]]();
            } else if (next[1] === "2") {
                this[next[0]]();
                this[next[0]]();
            } else {
                this[next]();
            }
        }
    }

    orientedLetter(letter) {
        let index = this.LetterToIndex[letter];
        index -= index % 3;
        return this.IndexToLetter[index];
    }
    compareLetters(letter_1, letter_2) {
        return this.orientedLetter(letter_1) === this.orientedLetter(letter_2);
    }
    getPiece(letter) {
        let solvedStateRaw = CubeCorners.solvedStateRaw;
        for (let i = 0; i < this._state.length; i++) {
            if (solvedStateRaw[i * 3] === letter) {
                return this._state[i][0];
            }
            if (solvedStateRaw[i * 3 + 1] === letter) {
                return this._state[i][1];
            }
            if (solvedStateRaw[i * 3 + 2] === letter) {
                return this._state[i][2];
            }
        }
    }
    getSolvedPiecesArray() {
        let array = [];
        for (let i = 0; i < 8; i++) {
            if (this.getPiece(this._state[i][0]) === this._state[i][0]) {
                array.push(true);
            } else {
                array.push(false);
            }
        }
        return array;
    }
    trace(buffer) {
        let solvedPieces = this.getSolvedPiecesArray();
        solvedPieces[this.OriLtrToIndex[this.orientedLetter(buffer)]] = true;
        let target = this.getPiece(buffer);
        let cycleStart = buffer;
        let path = [];
        let loopProtector = 0;
        while (!solvedPieces.every(value => value)) {
            if (loopProtector++ > 100) {
                console.error("Infinite loop detected on corner tracing");
                return "";
            }

            if (this.compareLetters(target, cycleStart) || this.compareLetters(target, buffer)) {
                if (this.compareLetters(target, cycleStart) && !this.compareLetters(target, buffer)) {
                    solvedPieces[this.OriLtrToIndex[this.orientedLetter(cycleStart)]] = true;
                    path.push(target);
                }
                let found = false;
                for (let i = 0; i < solvedPieces.length; i++) {
                    if (!solvedPieces[i]) {
                        let letter = this.IndexToOriLtr[i];
                        cycleStart = letter;
                        target = letter;
                        found = true;
                        break;
                    }
                }
                if (found) {
                    path.push(target);
                    target = this.getPiece(target);
                }
                continue;
            }
            path.push(target);
            solvedPieces[this.OriLtrToIndex[this.orientedLetter(target)]] = true;
            target = this.getPiece(target);
            
        }
        return path;
    }

    swap(index_1, index_2) {
        let swap = this._state[index_1];
        this._state[index_1] = this._state[index_2];
        this._state[index_2] = swap;
    }
    cycle4(index_1, index_2, index_3, index_4) {
        let swap = this._state[index_1];
        this._state[index_1] = this._state[index_4];
        this._state[index_4] = this._state[index_3];
        this._state[index_3] = this._state[index_2];
        this._state[index_2] = swap;
    }
    cycle4i(index_1, index_2, index_3, index_4) {
        let swap = this._state[index_1];
        this._state[index_1] = this._state[index_2];
        this._state[index_2] = this._state[index_3];
        this._state[index_3] = this._state[index_4];
        this._state[index_4] = swap;
    }
    twistCw(index) {
        this._state[index].push(this._state[index].shift());
    }
    twistCcw(index) {
        this._state[index].unshift(this._state[index].pop());
    }
    twistCcTurn(cw_index_1, ccw_index_2, cw_index_3, ccw_index_4) {
        this.twistCw (cw_index_1 );
        this.twistCcw(ccw_index_2);
        this.twistCw (cw_index_3 );
        this.twistCcw(ccw_index_4);
    }
    twistCcwTurn(ccw_index_1, cw_index_2, ccw_index_3, cw_index_4) {
        this.twistCcw(ccw_index_1);
        this.twistCw (cw_index_2 );
        this.twistCcw(ccw_index_3);
        this.twistCw (cw_index_4 );
    }

    U() {
        this.cycle4(this.OriLtrToIndex.A, this.OriLtrToIndex.B, this.OriLtrToIndex.C, this.OriLtrToIndex.D);
    }
    F() {
        this.cycle4(this.OriLtrToIndex.D, this.OriLtrToIndex.C, this.OriLtrToIndex.V, this.OriLtrToIndex.U);
        this.twistCcTurn(this.OriLtrToIndex.D, this.OriLtrToIndex.C, this.OriLtrToIndex.V, this.OriLtrToIndex.U);
    }
    R() {
        this.cycle4(this.OriLtrToIndex.C, this.OriLtrToIndex.B, this.OriLtrToIndex.W, this.OriLtrToIndex.V);
        this.twistCcTurn(this.OriLtrToIndex.C, this.OriLtrToIndex.B, this.OriLtrToIndex.W, this.OriLtrToIndex.V);
    }
    B() {
        this.cycle4(this.OriLtrToIndex.B, this.OriLtrToIndex.A, this.OriLtrToIndex.X, this.OriLtrToIndex.W);
        this.twistCcTurn(this.OriLtrToIndex.B, this.OriLtrToIndex.A, this.OriLtrToIndex.X, this.OriLtrToIndex.W);
    }
    L() {
        this.cycle4(this.OriLtrToIndex.A, this.OriLtrToIndex.D, this.OriLtrToIndex.U, this.OriLtrToIndex.X);
        this.twistCcTurn(this.OriLtrToIndex.A, this.OriLtrToIndex.D, this.OriLtrToIndex.U, this.OriLtrToIndex.X);
    }
    D() {
        this.cycle4(this.OriLtrToIndex.U, this.OriLtrToIndex.V, this.OriLtrToIndex.W, this.OriLtrToIndex.X);
    }
}

class Cube {
    constructor(string = Cube.solvedState) {
        this.state = string;
        this.edges = new CubeEdges();
        this.corners = new CubeCorners();
    }
    get state() {
        return this._state;
    }
    set state(string) {
        this._state = string.divideIntoChars();
    }

    static get solvedState() { return "AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQRRSSTTUUVVWWXX"; }

    reset() {
        this.edges.stateRaw = CubeEdges.solvedStateRaw;
        this.corners.stateRaw = CubeCorners.solvedStateRaw;
    }

    updateEdgeState() {
        let edgeState = this.edges.state;
        for (let i = 0; i < this._state.length / 2; i++) {
            this._state[i * 2 + 1] = edgeState[i];
        }
    }
    updateCornerState() {
        let cornerState = this.corners.state;
        for (let i = 0; i < this._state.length / 2; i++) {
            this._state[i * 2] = cornerState[i];
        }
    }

    static translateEdgeLetters(lettersString, letterScheme) {
        let solvedState = Cube.solvedState;
        let lettersArray = lettersString.divideIntoChars();
        for (let i = 1; i < solvedState.length; i += 2) {
            for (let j = 0; j < lettersArray.length; j++) {
                if (lettersArray[j] === solvedState[i]) {
                    lettersArray[j] = letterScheme[i];
                }
            }
        }
        return lettersArray.join("");
    }
    static translateCornerLetters(lettersString, letterScheme) {
        let solvedState = Cube.solvedState;
        let lettersArray = lettersString.divideIntoChars();
        for (let i = 0; i < solvedState.length; i += 2) {
            for (let j = 0; j < lettersArray.length; j++) {
                if (lettersArray[j] === solvedState[i]) {
                    lettersArray[j] = letterScheme[i];
                }
            }
        }
        return lettersArray.join("");
    }
    
    trace(edgeBuffer, cornerBuffer) {
        let edgeTrace = this.edges.trace(edgeBuffer);
        let edgeGroup = [];
        for (let i = 0; i < edgeTrace.length; i += 2) {
            let pair = edgeTrace[i];
            if (i + 1 < edgeTrace.length) {
                pair += edgeTrace[i + 1];
            }
            edgeGroup.push(pair);
        }

        let cornerTrace = this.corners.trace(cornerBuffer);
        let cornerGroup = [];
        for (let i = 0; i < cornerTrace.length; i += 2) {
            let pair = cornerTrace[i];
            if (i + 1 < cornerTrace.length) {
                pair += cornerTrace[i + 1];
            }
            cornerGroup.push(pair);
        }

        return {
            edges: edgeGroup.join(" "),
            corners: cornerGroup.join(" ")
        };
    }

    // }

    static FaceEnum = {
        U: 0,
        L: 1,
        F: 2,
        R: 3,
        B: 4,
        D: 5
    }

    execute(alg) {
        this.edges.execute(alg);
        this.updateEdgeState();
        this.corners.execute(alg);
        this.updateCornerState();
    }

    draw(ctx) {
        ctx.resetTransform();
        ctx.strokeStyle = "black";

        let canvasWidth = ctx.canvas.width;
        let canvasHeight = ctx.canvas.height;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        let margin = 10;
        let squareSize = Math.min((canvasWidth - margin * 3) / 12, (canvasHeight - margin * 2) / 9);
        let x = (canvasWidth - squareSize * 12 - margin * 3) / 2;
        let y = (canvasHeight - squareSize * 9 - margin * 2) / 2;
        ctx.translate(x, y);

        this.drawFace(ctx, Cube.FaceEnum.U, squareSize * 3 + margin,     0,                           squareSize);
        this.drawFace(ctx, Cube.FaceEnum.L, 0,                           squareSize * 3 + margin,     squareSize);
        this.drawFace(ctx, Cube.FaceEnum.F, squareSize * 3 + margin,     squareSize * 3 + margin,     squareSize);
        this.drawFace(ctx, Cube.FaceEnum.R, squareSize * 6 + margin * 2, squareSize * 3 + margin,     squareSize);
        this.drawFace(ctx, Cube.FaceEnum.B, squareSize * 9 + margin * 3, squareSize * 3 + margin,     squareSize);
        this.drawFace(ctx, Cube.FaceEnum.D, squareSize * 3 + margin    , squareSize * 6 + margin * 2, squareSize);
    }
    faceX(i) {
        switch (i % 8) {
            case 0: case 6: case 7: return 0;
            case 1: case 5:         return 1;
            case 2: case 3: case 4: return 2;
        }
        // return i % 8 <= 4 ? Math.min(i % 8, 2) : Math.max(6 - (i % 8), 0);
    }
    faceY(i) {
        switch (i % 8) {
            case 0: case 1: case 2: return 0;
            case 3: case 7:         return 1;
            case 4: case 5: case 6: return 2;
        }
        // if (i % 8 === 7) return 1;
        // return i % 8 <= 2 ? 0 : Math.min(i % 8 - 2, 2);
    }
    drawFace(ctx, faceEnum, offsetX, offsetY, squareSize) {
        ctx.fillStyle = Cube.colors[faceEnum];
        ctx.fillRect(offsetX, offsetY, squareSize * 3, squareSize * 3);
        for (let i = faceEnum * 8; i < (faceEnum + 1) * 8; i++) {
            let x = this.faceX(i) * squareSize;
            let y = this.faceY(i) * squareSize;
            ctx.fillStyle = Cube.colors[Cube.letters[this._state[i]]];
            ctx.fillRect(x + offsetX, y + offsetY, squareSize, squareSize);
            ctx.strokeRect(x + offsetX, y + offsetY, squareSize, squareSize);
        }
    }

    static colors = [
        "white", "orange", "green", "red", "blue", "yellow" // ULFRBD
    ]
    static letters = {
        A: Cube.FaceEnum.U,
        B: Cube.FaceEnum.U,
        C: Cube.FaceEnum.U,
        D: Cube.FaceEnum.U,
        E: Cube.FaceEnum.L,
        F: Cube.FaceEnum.L,
        G: Cube.FaceEnum.L,
        H: Cube.FaceEnum.L,
        I: Cube.FaceEnum.F,
        J: Cube.FaceEnum.F,
        K: Cube.FaceEnum.F,
        L: Cube.FaceEnum.F,
        M: Cube.FaceEnum.R,
        N: Cube.FaceEnum.R,
        O: Cube.FaceEnum.R,
        P: Cube.FaceEnum.R,
        Q: Cube.FaceEnum.B,
        R: Cube.FaceEnum.B,
        S: Cube.FaceEnum.B,
        T: Cube.FaceEnum.B,
        U: Cube.FaceEnum.D,
        V: Cube.FaceEnum.D,
        W: Cube.FaceEnum.D,
        X: Cube.FaceEnum.D
    }
}

// const superflip = new Alg("U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2");
// TODO: Responsive resizing

const trainerCanvas = document.getElementById("trainer-canvas");
trainerCanvas.width = trainerCanvas.clientWidth;
trainerCanvas.height = trainerCanvas.clientHeight;
const trainerCtx = trainerCanvas.getContext("2d");

const scrambleOutput = document.getElementById("scramble");
const edgeMemoOutput = document.getElementById("edge-memo");
const cornerMemoOutput = document.getElementById("corner-memo");


const cube = new Cube();

const nextScramble = function() {
    cube.reset();
    const scramble = Alg.randomScramble(20);
    cube.execute(scramble);
    
    const edgeBuffer = Cube.translateEdgeLetters(config.settings.edgeBuffer, config.settings.letterScheme);
    const cornerBuffer = Cube.translateCornerLetters(config.settings.cornerBuffer, config.settings.letterScheme);
    const trace = cube.trace(edgeBuffer, cornerBuffer);
    
    const edgeMemo = Cube.translateEdgeLetters(trace.edges, config.settings.letterScheme);
    const cornerMemo = Cube.translateCornerLetters(trace.corners, config.settings.letterScheme);
    
    cube.draw(trainerCtx);
    
    scrambleOutput.textContent = scramble.toString();
    edgeMemoOutput.textContent = edgeMemo;
    cornerMemoOutput.textContent = cornerMemo;
};

const config = new TrainerConfig();
config.addEventListeners();
config.subscribe("nextScramble", nextScramble);
config.subscribe("closeConfig", nextScramble);

nextScramble();