export var Face;
(function (Face) {
    Face[Face["U"] = 0] = "U";
    Face[Face["L"] = 1] = "L";
    Face[Face["F"] = 2] = "F";
    Face[Face["R"] = 3] = "R";
    Face[Face["B"] = 4] = "B";
    Face[Face["D"] = 5] = "D";
})(Face || (Face = {}));
;
function oppositeFace(face) {
    switch (face) {
        case Face.U: return Face.D;
        case Face.F: return Face.B;
        case Face.R: return Face.L;
        case Face.B: return Face.F;
        case Face.L: return Face.R;
        case Face.D: return Face.U;
        default: return Face.U;
    }
}
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
function rotateIndexCw(index, size) {
    let x = index % size;
    let y = Math.floor(index / size);
    let newX = size - y - 1;
    let newY = x;
    return newY * size + newX;
}
function rotateIndexCcw(index, size) {
    let x = index % size;
    let y = Math.floor(index / size);
    let newX = y;
    let newY = size - x - 1;
    return newY * size + newX;
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
    solve() {
        let stickersPerFace = this.layerCount * this.layerCount;
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < stickersPerFace; j++) {
                this.stickers[i][j] = i;
            }
        }
    }
    solved() {
        let stickersPerFace = this.layerCount * this.layerCount;
        for (let i = 0; i < 6; i++) {
            let faceColor = this.stickers[i][0];
            for (let j = 1; j < stickersPerFace; j++) {
                if (this.stickers[i][j] !== faceColor) {
                    return false;
                }
            }
        }
        return true;
    }
    static memo(numPieces, buffer, cycleBreakOrder, getBaseIndex, getPiece) {
        cycleBreakOrder = cycleBreakOrder.filter(piece => piece !== getPiece(piece));
        const isSamePiece = (a, b) => {
            return getBaseIndex(a) === getBaseIndex(b);
        };
        const solvedPieces = Array(numPieces);
        const memo = [];
        let target = getPiece(buffer);
        let cycleStart = buffer;
        solvedPieces[getBaseIndex(buffer)] = true;
        let loopProtector = 0;
        memoLoop: while (true) {
            if (loopProtector++ > 100) {
                throw new Error("Infinite loop error");
            }
            if (isSamePiece(target, cycleStart) || isSamePiece(target, buffer)) {
                if (isSamePiece(target, cycleStart) && !isSamePiece(target, buffer)) {
                    solvedPieces[getBaseIndex(cycleStart)] = true;
                    memo.push(target);
                }
                while (true) {
                    const cycleBreak = cycleBreakOrder.shift();
                    if (cycleBreak === undefined) {
                        break memoLoop;
                    }
                    if (!solvedPieces[getBaseIndex(cycleBreak)]) {
                        cycleStart = cycleBreak;
                        break;
                    }
                }
                target = cycleStart;
                memo.push(target);
                target = getPiece(target);
                continue;
            }
            memo.push(target);
            solvedPieces[getBaseIndex(target)] = true;
            target = getPiece(target);
        }
        return memo;
    }
    memoEdges(buffer, cycleBreakOrder) {
        const edges = this.getEdgeIndices();
        const getBaseIndex = (index) => {
            return Math.floor(index / 2);
        };
        const getPiece = (target) => {
            const targetEdge = edges[getBaseIndex(target)];
            return (targetEdge - targetEdge % 2) + (targetEdge + target) % 2;
        };
        return Cube.memo(edges.length, buffer, cycleBreakOrder, getBaseIndex, getPiece);
    }
    static getEdgeBaseIndex(edge) {
        const edgeHash = edge.reduce((acc, val) => acc | (1 << val), 0);
        switch (edgeHash) {
            case 0b010001: return 0;
            case 0b001001: return 1;
            case 0b000101: return 2;
            case 0b000011: return 3;
            case 0b001100: return 4;
            case 0b000110: return 5;
            case 0b010010: return 6;
            case 0b011000: return 7;
            case 0b100100: return 8;
            case 0b101000: return 9;
            case 0b110000: return 10;
            case 0b100010: return 11;
            default: throw new Error(`Invalid hash: ${edgeHash.toString(2)}`);
        }
    }
    getEdgeIndices() {
        const edges = this.getEdges(Math.floor(this.layerCount / 2));
        const indices = Array(edges.length);
        for (let i = 0; i < edges.length; i++) {
            const edge = edges[i];
            let flipped;
            if (edge.some(val => (val === Face.U || val === Face.D))) {
                flipped = !(edge[0] === Face.U || edge[0] === Face.D);
            }
            else {
                flipped = !(edge[0] === Face.F || edge[0] === Face.B);
            }
            const baseIndex = Cube.getEdgeBaseIndex(edge);
            indices[i] = baseIndex * 2 + Number(flipped);
        }
        return indices;
    }
    memoCorners(buffer, cycleBreakOrder) {
        const corners = this.getCornerIndices();
        const getBaseIndex = (index) => {
            return Math.floor(index / 3);
        };
        const getPiece = (target) => {
            const targetCorner = corners[getBaseIndex(target)];
            return (targetCorner - targetCorner % 3) + (targetCorner + target) % 3;
        };
        return Cube.memo(corners.length, buffer, cycleBreakOrder, getBaseIndex, getPiece);
    }
    static getCornerBaseIndex(triplet) {
        const tripletHash = triplet.reduce((acc, val) => acc | (1 << val), 0);
        switch (tripletHash) {
            case 0b010011: return 0;
            case 0b011001: return 1;
            case 0b001101: return 2;
            case 0b000111: return 3;
            case 0b100110: return 4;
            case 0b101100: return 5;
            case 0b111000: return 6;
            case 0b110010: return 7;
            default: throw `Invalid hash: '${tripletHash.toString(2)}'`;
        }
    }
    getCornerIndices() {
        const corners = this.getCorners();
        const indices = Array(corners.length);
        for (let i = 0; i < corners.length; i++) {
            const corner = corners[i];
            if (i % 2 === 1) {
                const swap = corner[1];
                corner[1] = corner[2];
                corner[2] = swap;
            }
            let topColorIndex = corner.findIndex(val => (val === Face.U || val === Face.D));
            if (topColorIndex === -1) {
                throw new Error(`Invalid corner triplet: [${corner.join(", ")}]`);
            }
            const baseIndex = Cube.getCornerBaseIndex(corner);
            let index = baseIndex * 3 + topColorIndex;
            indices[i] = index;
        }
        return indices;
    }
    getCenters(index) {
        const centers = [];
        for (let face = 0; face < 6; face++) {
            for (let i = 0; i < 4; i++) {
                centers.push(this.stickers[face][index]);
                index = rotateIndexCw(index, this.layerCount);
            }
        }
        return centers;
    }
    getEdges(index) {
        const wings = [];
        const faces = [Face.U, Face.L, Face.F, Face.R, Face.B, Face.D];
        for (const face of faces) {
            for (let i = 0; i < 4; i++) {
                wings.push(this.stickers[face][index]);
                index = rotateIndexCw(index, this.layerCount);
            }
        }
        const U = wings.slice(0, 4);
        const L = wings.slice(4, 8);
        const F = wings.slice(8, 12);
        const R = wings.slice(12, 16);
        const B = wings.slice(16, 20);
        const D = wings.slice(20, 24);
        return [
            [U[0], B[0]], [U[1], R[0]], [U[2], F[0]], [U[3], L[0]],
            [F[1], R[3]], [F[3], L[1]], [B[1], L[3]], [B[3], R[1]],
            [D[0], F[2]], [D[1], R[2]], [D[2], B[2]], [D[3], L[2]]
        ];
    }
    getWings(index) {
        const groupA = this.getEdges(index);
        const groupB = this.getEdges(this.layerCount - index - 1);
        console.assert(groupA.length === 12 && groupB.length === 12);
        const wings = Array(24);
        for (let i = 0; i < 12; i++) {
            wings[i * 2] = groupA[i];
            wings[i * 2 + 1] = groupB[i];
        }
        return wings;
    }
    getCorners() {
        const corners = [];
        const faces = [Face.U, Face.L, Face.F, Face.R, Face.B, Face.D];
        let index = 0;
        for (const face of faces) {
            for (let i = 0; i < 4; i++) {
                corners.push(this.stickers[face][index]);
                index = rotateIndexCw(index, this.layerCount);
            }
        }
        const U = corners.slice(0, 4);
        const L = corners.slice(4, 8);
        const F = corners.slice(8, 12);
        const R = corners.slice(12, 16);
        const B = corners.slice(16, 20);
        const D = corners.slice(20, 24);
        return [
            [U[0], B[1], L[0]], [U[1], B[0], R[1]], [U[2], F[1], R[0]], [U[3], F[0], L[1]],
            [D[0], F[3], L[2]], [D[1], F[2], R[3]], [D[2], B[3], R[2]], [D[3], B[2], L[3]]
        ];
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
        node.style.setProperty("--layer-count", this.layerCount.toString());
        node.replaceChildren(this.emptyFace(), this.faceHtml(Face.U), this.emptyFace(), this.emptyFace(), this.faceHtml(Face.L), this.faceHtml(Face.F), this.faceHtml(Face.R), this.faceHtml(Face.B), this.emptyFace(), this.faceHtml(Face.D));
    }
    static getAdjacentFaces(face) {
        let Dir;
        (function (Dir) {
            Dir[Dir["U"] = 0] = "U";
            Dir[Dir["R"] = 3] = "R";
            Dir[Dir["L"] = 1] = "L";
            Dir[Dir["D"] = 5] = "D";
        })(Dir || (Dir = {}));
        const $ = (face, direction) => ({ face, direction });
        switch (face) {
            case Face.U:
                return [$(Face.B, Dir.U), $(Face.R, Dir.U), $(Face.F, Dir.U), $(Face.L, Dir.U)];
            case Face.L:
                return [$(Face.U, Dir.L), $(Face.F, Dir.L), $(Face.D, Dir.L), $(Face.B, Dir.R)];
            case Face.F:
                return [$(Face.U, Dir.D), $(Face.R, Dir.L), $(Face.D, Dir.U), $(Face.L, Dir.R)];
            case Face.R:
                return [$(Face.U, Dir.R), $(Face.B, Dir.L), $(Face.D, Dir.R), $(Face.F, Dir.R)];
            case Face.B:
                return [$(Face.U, Dir.U), $(Face.L, Dir.L), $(Face.D, Dir.D), $(Face.R, Dir.R)];
            case Face.D:
                return [$(Face.F, Dir.D), $(Face.R, Dir.D), $(Face.B, Dir.D), $(Face.L, Dir.D)];
            default:
                console.error(`Invalid face: ${face}`);
                return [];
        }
    }
    cycleFaceCw(face) {
        let faceArray = this.stickers[face];
        let copyArray = faceArray.slice();
        for (let i = 0; i < faceArray.length; i++) {
            faceArray[i] = copyArray[rotateIndexCcw(i, this.layerCount)];
        }
    }
    cycleFaceCcw(face) {
        let faceArray = this.stickers[face];
        let copyArray = faceArray.slice();
        for (let i = 0; i < faceArray.length; i++) {
            faceArray[i] = copyArray[rotateIndexCw(i, this.layerCount)];
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
        const adjFaces = Cube.getAdjacentFaces(face);
        const faceIndices = [];
        for (const adjFace of adjFaces) {
            faceIndices.push(this.faceThread(adjFace.direction, depth));
        }
        let firstCopy = [];
        for (const index of faceIndices[0]) {
            firstCopy[index] = this.stickers[adjFaces[0].face][index];
        }
        for (let i = 0; i < faceIndices.length; i++) {
            const arr = this.stickers?.[adjFaces[i + 1]?.face] ?? firstCopy;
            for (let j = 0; j < faceIndices[0].length; j++) {
                const currIndex = faceIndices[i][j];
                const nextIndex = faceIndices[(i + 1) % faceIndices.length][j];
                if (!Number.isInteger(arr[nextIndex])) {
                    console.error(`Invalid index: ${nextIndex}`);
                    continue;
                }
                this.stickers[adjFaces[i].face][currIndex] = arr[nextIndex];
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
            if (deep >= this.layerCount) {
                this.cycleFace(oppositeFace(face), !counterclockwise);
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
            if (deep >= this.layerCount) {
                let opposite = oppositeFace(face);
                this.cycleFaceCw(opposite);
                this.cycleFaceCw(opposite);
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
            }
            else {
                console.error(`Move ${move.face} not supported.`);
            }
        }
    }
}
