var Face;
(function (Face) {
    Face[Face["U"] = 0] = "U";
    Face[Face["F"] = 1] = "F";
    Face[Face["R"] = 2] = "R";
    Face[Face["B"] = 3] = "B";
    Face[Face["L"] = 4] = "L";
    Face[Face["D"] = 5] = "D";
})(Face || (Face = {}));
;
function faceToString(face) {
    switch (face) {
        case Face.U: return "U";
        case Face.F: return "F";
        case Face.R: return "R";
        case Face.B: return "B";
        case Face.L: return "L";
        case Face.D: return "D";
        default: return "?";
    }
}
function stringToFace(string) {
    switch (string.toUpperCase()) {
        case "U": return Face.U;
        case "F": return Face.F;
        case "R": return Face.R;
        case "B": return Face.B;
        case "L": return Face.L;
        case "D": return Face.D;
        default: return -1;
    }
}
export class Cube {
    constructor(layerCount) {
        console.assert(Number.isInteger(layerCount) && layerCount > 1);
        this.layerCount = layerCount;
        let stickersPerFace = layerCount * layerCount;
        this.stickers = Array(6);
        for (let i = 0; i < 6; i++) {
            this.stickers[i] = Array(stickersPerFace);
            for (let j = 0; j < stickersPerFace; j++) {
                this.stickers[i][j] = i;
            }
        }
    }
    static fromString(state) {
        const layerCount = Math.floor(Math.sqrt(state.length / 6));
        const sqLayerCount = layerCount * layerCount;
        const cube = new Cube(layerCount);
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < sqLayerCount; j++) {
                cube.stickers[i][j] = stringToFace(state[i * sqLayerCount + j]);
            }
        }
        return cube;
    }
    toString() {
        const stringArray = [];
        const sqLayerCount = this.layerCount * this.layerCount;
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < sqLayerCount; j++) {
                stringArray.push(faceToString(this.stickers[i][j]));
            }
        }
        return stringArray.join("");
    }
    getLayerCount() {
        return this.layerCount;
    }
    faceHtml(face) {
        const nodes = [];
        for (const faceColor of this.stickers[face]) {
            const node = document.createElement("div");
            node.classList.add("sticker");
            node.classList.add(faceToString(faceColor));
            nodes.push(node);
        }
        const faceNode = document.createElement("div");
        faceNode.classList.add("face");
        faceNode.replaceChildren(...nodes);
        return faceNode;
    }
    emptyFace() {
        const faceNode = document.createElement("div");
        faceNode.classList.add("face");
        return faceNode;
    }
    html(node) {
        node.classList.add("cube");
        node.replaceChildren(this.emptyFace(), this.faceHtml(Face.U), this.emptyFace(), this.emptyFace(), this.faceHtml(Face.L), this.faceHtml(Face.F), this.faceHtml(Face.R), this.faceHtml(Face.B), this.emptyFace(), this.faceHtml(Face.D));
    }
    adjacentFaces(face) {
        let Dir;
        (function (Dir) {
            Dir[Dir["U"] = 0] = "U";
            Dir[Dir["R"] = 2] = "R";
            Dir[Dir["L"] = 4] = "L";
            Dir[Dir["D"] = 5] = "D";
        })(Dir || (Dir = {}));
        switch (face) {
            case Face.U:
                return [[Face.F, Dir.U], [Face.L, Dir.U], [Face.B, Dir.U], [Face.R, Dir.U]];
            case Face.L:
                return [[Face.U, Dir.L], [Face.F, Dir.L], [Face.D, Dir.L], [Face.B, Dir.R]];
            case Face.F:
                return [[Face.U, Dir.D], [Face.R, Dir.L], [Face.D, Dir.U], [Face.L, Dir.R]];
            case Face.R:
                return [[Face.U, Dir.R], [Face.B, Dir.L], [Face.D, Dir.R], [Face.F, Dir.R]];
            case Face.B:
                return [[Face.U, Dir.U], [Face.L, Dir.L], [Face.D, Dir.D], [Face.R, Dir.R]];
            case Face.D:
                return [[Face.F, Dir.D], [Face.R, Dir.D], [Face.B, Dir.D], [Face.L, Dir.D]];
            default:
                console.error(`Invalid face: ${face}`);
                return [];
        }
    }
    cycleFaceCw(face) {
        let faceArray = this.stickers[face];
        let copyArray = faceArray.slice();
        for (let i = 0; i < faceArray.length; i++) {
            let x = i % this.layerCount;
            let y = Math.floor(i / this.layerCount);
            let newX = y;
            let newY = this.layerCount - x - 1;
            let newI = newY * this.layerCount + newX;
            faceArray[i] = copyArray[newI];
        }
    }
    cycleFaceCcw(face) {
        let faceArray = this.stickers[face];
        let copyArray = faceArray.slice();
        for (let i = 0; i < faceArray.length; i++) {
            let x = i % this.layerCount;
            let y = Math.floor(i / this.layerCount);
            let newX = this.layerCount - y - 1;
            let newY = x;
            let newI = newY * this.layerCount + newX;
            faceArray[i] = copyArray[newI];
        }
    }
    cycleFace(face, counterclockwise) {
        if (counterclockwise) {
            this.cycleFaceCcw(face);
        }
        else {
            this.cycleFaceCw(face);
        }
    }
    faceThread(direction, depth) {
        const array = [];
        switch (direction) {
            case Face.U: {
                let startIndex = depth * this.layerCount;
                for (let i = 0; i < this.layerCount; i++) {
                    array.push(startIndex + i);
                }
                return array;
            }
            case Face.R: {
                let startIndex = this.layerCount - depth - 1;
                for (let i = 0; i < this.layerCount; i++) {
                    array.push(startIndex + this.layerCount * i);
                }
                return array;
            }
            case Face.L: {
                let startIndex = depth;
                for (let i = this.layerCount - 1; i >= 0; i--) {
                    array.push(startIndex + this.layerCount * i);
                }
                return array;
            }
            case Face.D: {
                let startIndex = (this.layerCount - depth) * this.layerCount - this.layerCount;
                for (let i = this.layerCount - 1; i >= 0; i--) {
                    array.push(startIndex + i);
                }
                return array;
            }
            default:
                console.error(`Invalid direction: ${direction}`);
                return [];
        }
    }
    cycleThreadCcw(face, depth) {
        const adjFaces = this.adjacentFaces(face);
        const faceIndices = [];
        for (const adjFace of adjFaces) {
            faceIndices.push(this.faceThread(adjFace[1], depth));
        }
        let firstCopy = [];
        for (const index of faceIndices[0]) {
            firstCopy[index] = this.stickers[adjFaces[0][0]][index];
        }
        for (let i = 0; i < faceIndices.length; i++) {
            const arr = this.stickers?.[adjFaces[i + 1]?.[0]] ?? firstCopy;
            for (let j = 0; j < faceIndices[0].length; j++) {
                const currIndex = faceIndices[i][j];
                const nextIndex = faceIndices[(i + 1) % faceIndices.length][j];
                if (!Number.isInteger(arr[nextIndex])) {
                    console.error(`Invalid index: ${nextIndex}`);
                    continue;
                }
                this.stickers[adjFaces[i][0]][currIndex] = arr[nextIndex];
            }
        }
    }
    cycleThreadCw(face, depth) {
        for (let i = 0; i < 3; i++) {
            this.cycleThreadCcw(face, depth);
        }
    }
    cycleThread(face, depth, counterclockwise) {
        if (counterclockwise) {
            this.cycleThreadCcw(face, depth);
        }
        else {
            this.cycleThreadCw(face, depth);
        }
    }
    reset() {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < this.stickers[i].length; j++) {
                this.stickers[i][j] = i;
            }
        }
    }
    move(face, amount, shallow = 1, deep = 1) {
        let counterclockwise = amount < 0;
        amount = Math.abs(amount) % 4;
        if (amount === 0) {
            return;
        }
        counterclockwise = (amount === 3) !== counterclockwise;
        let double = amount === 2;
        shallow = Math.min(shallow, this.layerCount);
        deep = Math.min(deep, this.layerCount);
        if (!double) {
            if (shallow === 1) {
                this.cycleFace(face, counterclockwise);
            }
            for (let i = shallow - 1; i < deep; i++) {
                this.cycleThread(face, i, counterclockwise);
            }
        }
        else {
            if (shallow === 1) {
                this.cycleFaceCw(face);
                this.cycleFaceCw(face);
            }
            for (let i = shallow - 1; i < deep; i++) {
                this.cycleThreadCw(face, i);
                this.cycleThreadCw(face, i);
            }
        }
    }
    execute(alg) {
        for (const move of alg) {
            if ("UFRBLD".indexOf(move.face) > -1) {
                this.move(stringToFace(move.face), move.amount, move.shallow, move.deep);
            }
            else if ("MES".indexOf(move.face) > -1) {
                if (this.layerCount % 2 === 0)
                    continue;
                let faceNum = stringToFace("LDF"["MES".indexOf(move.face)]);
                let depth = (this.layerCount - 1) / 2 + 1;
                this.move(faceNum, move.amount, depth, depth);
            }
            else if ("mes".indexOf(move.face) > -1) {
                let faceNum = stringToFace("LDF"["mes".indexOf(move.face)]);
                this.move(faceNum, move.amount, 2, this.layerCount - 1);
            }
            else if ("xyz".indexOf(move.face) > -1) {
                let faceNum = stringToFace("RUF"["xyz".indexOf(move.face)]);
                this.move(faceNum, move.amount, 1, this.layerCount);
                let oppositeFaceNum = stringToFace("LDB"["xyz".indexOf(move.face)]);
                this.move(oppositeFaceNum, -move.amount, 1, 0);
            }
            else {
                console.error(`Move ${move.face} not supported.`);
            }
        }
    }
}
