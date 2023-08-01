import { Alg } from "./alg.js";

export enum Face {
    U = 0,
    L = 1,
    F = 2,
    R = 3,
    B = 4,
    D = 5
};

function oppositeFace(face: Face): Face {
    switch (face) {
        case Face.U: return Face.D;
        case Face.F: return Face.B;
        case Face.R: return Face.L;
        case Face.B: return Face.F;
        case Face.L: return Face.R;
        case Face.D: return Face.U;
        default:     return Face.U;
    }
}
function faceToString(face: Face): string {
    switch (face) {
        case Face.U: return "U";
        case Face.F: return "F";
        case Face.R: return "R";
        case Face.B: return "B";
        case Face.L: return "L";
        case Face.D: return "D";
        default:     return "?";
    }
}
function stringToFace(string: string): Face {
    switch(string.toUpperCase()) {
        case "U": return Face.U;
        case "F": return Face.F;
        case "R": return Face.R;
        case "B": return Face.B;
        case "L": return Face.L;
        case "D": return Face.D;
        default:  return -1 as Face;
    }
}
function rotateIndexCw(index: number, size: number): number {
    let x = index % size;
    let y = Math.floor(index / size);

    // [x][layerCount - y - 1]
    let newX = size - y - 1;
    let newY = x;

    return newY * size + newX;
}
function rotateIndexCcw(index: number, size: number): number {
    let x = index % size;
    let y = Math.floor(index / size);

    // [layerCount - x - 1][y]
    let newX = y;
    let newY = size - x - 1;

    return newY * size + newX;
}

export class Cube {
    private layerCount: number;
    public stickers: Face[][];

    constructor(layerCount: number) {
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
    static fromString(state: string): Cube {
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
    toString(): string {
        const stringArray = [];
        const sqLayerCount = this.layerCount * this.layerCount;
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < sqLayerCount; j++) {
                stringArray.push(faceToString(this.stickers[i][j]));
            }
        }
        return stringArray.join("");
    }
    getLayerCount(): number {
        return this.layerCount;
    }
    solve(): void {
        let stickersPerFace = this.layerCount * this.layerCount;
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < stickersPerFace; j++) {
                this.stickers[i][j] = i;
            }
        }
    }
    solved(): boolean {
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

    private getCenters(index: number): Face[] {
        const centers: Face[] = [];

        for (let face = 0; face < 6; face++) {
            for (let i = 0; i < 4; i++) {
                centers.push(this.stickers[face][index]);

                index = rotateIndexCw(index, this.layerCount);
            }
        }

        return centers;
    }

    private getEdges(index: number): Face[][] {
        const wings: Face[] = [];

        const faces = [Face.U, Face.L, Face.F, Face.R, Face.B, Face.D];
        for (const face of faces) {
            for (let i = 0; i < 4; i++) {
                wings.push(this.stickers[face][index]);
                index = rotateIndexCw(index, this.layerCount);
            }
        }

        const U = wings.slice( 0,  4);
        const L = wings.slice( 4,  8);
        const F = wings.slice( 8, 12);
        const R = wings.slice(12, 16);
        const B = wings.slice(16, 20);
        const D = wings.slice(20, 24);

        return [
            [U[0], B[0]], [U[1], R[0]], [U[2], F[0]], [U[3], L[0]],
            [F[1], R[3]], [F[3], L[1]], [B[1], L[3]], [B[3], R[1]],
            [D[0], F[2]], [D[1], R[2]], [D[2], B[2]], [D[3], L[2]]
        ];
    }

    private getWings(index: number): Face[][] {
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

    private getCorners(): Face[][] {
        const corners: Face[] = [];
        
        const faces = [Face.U, Face.L, Face.F, Face.R, Face.B, Face.D];
        let index = 0;
        for (const face of faces) {
            for (let i = 0; i < 4; i++) {
                corners.push(this.stickers[face][index]);
                index = rotateIndexCw(index, this.layerCount);
            }
        }

        const U = corners.slice( 0,  4);
        const L = corners.slice( 4,  8);
        const F = corners.slice( 8, 12);
        const R = corners.slice(12, 16);
        const B = corners.slice(16, 20);
        const D = corners.slice(20, 24);

        return [
            [U[0], B[1], L[0]], [U[1], B[0], R[1]], [U[2], F[1], R[0]], [U[3], F[0], L[1]],
            [D[0], F[3], L[2]], [D[1], F[2], R[3]], [D[2], B[3], R[2]], [D[3], B[2], L[3]]
        ];
    }

    private faceHtml(face: Face): HTMLElement {
        const nodes: HTMLElement[] = [];
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
    private emptyFace(): HTMLElement {
        const faceNode = document.createElement("div");
        faceNode.classList.add("face");
        return faceNode;
    }
    html(node: HTMLElement): void {
        node.classList.add("cube");
        node.style.setProperty("--layer-count", this.layerCount.toString());
        node.replaceChildren(
            this.emptyFace(),
            this.faceHtml(Face.U),
            this.emptyFace(),
            this.emptyFace(),
            this.faceHtml(Face.L),
            this.faceHtml(Face.F),
            this.faceHtml(Face.R),
            this.faceHtml(Face.B),
            this.emptyFace(),
            this.faceHtml(Face.D)
        );
    }

    /**
     * Returns the four adjacent faces (cw) to the inputted face as well as
     * the side of the face where pieces should be cycled. The faces returned
     * are in the order of top, right, bottom, left relative to the inputted
     * face. For example, for U, adjacentFaces will return B, R, F, L.
     * 
     * Direction numerical values are one to one with Face
     */
    private static getAdjacentFaces(face: Face): { face: Face, direction: number }[] {
        enum Dir {
            U = Face.U,
            R = Face.R,
            L = Face.L,
            D = Face.D
        }

        // Shorthand function for creating this object: { face: Face, direction: number }
        const $ = (face: Face, direction: number) => ({ face, direction });

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
    private cycleFaceCw(face: Face): void {
        let faceArray = this.stickers[face];
        let copyArray = faceArray.slice();

        for (let i = 0; i < faceArray.length; i++) {
            faceArray[i] = copyArray[rotateIndexCcw(i, this.layerCount)];
        }
    }
    private cycleFaceCcw(face: Face): void {
        let faceArray = this.stickers[face];
        let copyArray = faceArray.slice();

        for (let i = 0; i < faceArray.length; i++) {
            faceArray[i] = copyArray[rotateIndexCw(i, this.layerCount)];
        }
    }
    private cycleFace(face: Face, counterclockwise: boolean): void {
        if (counterclockwise) {
            this.cycleFaceCcw(face);
        } else {
            this.cycleFaceCw(face);
        }
    }
    /**
     * Returns indices for a thread on a specific face at the specific depth
     */
    private faceThread(direction: Face, depth: number): number[] {
        const array: number[] = [];
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
    private cycleThreadCcw(face: Face, depth: number): void {
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
    private cycleThreadCw(face: Face, depth: number): void {
        for (let i = 0; i < 3; i++) {
            this.cycleThreadCcw(face, depth);
        }
    }
    private cycleThread(face: Face, depth: number, counterclockwise: boolean): void {
        if (counterclockwise) {
            this.cycleThreadCcw(face, depth);
        } else {
            this.cycleThreadCw(face, depth);
        }
    }

    reset(): void {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < this.stickers[i].length; j++) {
                this.stickers[i][j] = i;
            }
        }
    }
    move(face: Face, amount: number, shallow: number = 1, deep: number = 1): void {
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
            // shallow - 1 to start indexing depth at 0 instead of 1
            for (let i = shallow - 1; i < deep; i++) {
                this.cycleThread(face, i, counterclockwise);
            }
        } else {
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
    execute(alg: Alg): void {
        for (const move of alg) {
            if ("UFRBLD".indexOf(move.face) > -1) {
                this.move(stringToFace(move.face), move.amount, move.shallow, move.deep);
            } else if ("MES".indexOf(move.face) > -1) {
                if (this.layerCount % 2 === 0) continue;
                let faceNum = stringToFace("LDF"["MES".indexOf(move.face)]);
                let depth = (this.layerCount - 1) / 2 + 1;
                this.move(faceNum, move.amount, depth, depth);
            } else if ("mes".indexOf(move.face) > -1) {
                let faceNum = stringToFace("LDF"["mes".indexOf(move.face)]);
                this.move(faceNum, move.amount, 2, this.layerCount - 1);
            } else if ("xyz".indexOf(move.face) > -1) {
                let faceNum = stringToFace("RUF"["xyz".indexOf(move.face)]);
                this.move(faceNum, move.amount, 1, this.layerCount);
                // let oppositeFaceNum = stringToFace("LDB"["xyz".indexOf(move.face)]);
                // this.move(oppositeFaceNum, -move.amount, 1, 0);
            } else {
                console.error(`Move ${move.face} not supported.`);
            }
        }
    }
}