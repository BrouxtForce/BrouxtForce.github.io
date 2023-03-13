import { SiGNTokens, SiGNTokenInputStream } from "./sign-tokens.js";
import { MoveIterator, CommutatorIterator, ConjugateIterator, AlgIterator, EmptyIterator } from "./alg-iterator.js";
export class Move {
    constructor(face, shallow, deep, amount) {
        this.shallow = 1;
        this.deep = 1;
        this.face = face;
        this.shallow = shallow;
        this.deep = deep;
        this.amount = amount;
    }
    static fromString(moveString) {
        let face, shallow = 1, deep = 1, amount = 1;
        const stream = new SiGNTokenInputStream(moveString);
        let char = stream.input.peek();
        if (stream.isNumber(char)) {
            deep = Number.parseInt(stream.readNumber());
            if (stream.input.peek() === "-") {
                stream.input.next();
                let newDeep = Number.parseInt(stream.readNumber());
                shallow = deep;
                deep = newDeep;
            }
        }
        face = stream.input.next();
        if (face === face.toUpperCase() && stream.input.peek() !== "w" && deep !== 1) {
            shallow = deep;
        }
        if (stream.input.peek() === "w" || face === face.toLowerCase()) {
            if (deep === 1) {
                deep = 2;
            }
        }
        if ("UFRBLD".indexOf(face.toUpperCase()) !== -1) {
            face = face.toUpperCase();
        }
        if (stream.input.peek() === "w") {
            stream.input.next();
        }
        if (stream.isNumber(stream.input.peek()) && !stream.input.eof()) {
            amount = Number.parseInt(stream.readNumber());
        }
        if (stream.input.peek() === "'") {
            stream.input.next();
            amount *= -1;
        }
        if (!Number.isSafeInteger(shallow) || !Number.isSafeInteger(deep) || !Number.isSafeInteger(amount)) {
            throw `Number too large to have precise behavior.`;
        }
        if ("UFRBLDMESmesxyz".indexOf(face) === -1 ||
            face.length !== 1 ||
            shallow > deep ||
            shallow < 1) {
            return null;
        }
        return new Move(face, shallow, deep, amount);
    }
    copy() {
        return new Move(this.face, this.shallow, this.deep, this.amount);
    }
    expand() {
        return [this.copy()];
    }
    invert() {
        this.amount *= -1;
        return this;
    }
    inverted() {
        return new Move(this.face, this.shallow, this.deep, -this.amount);
    }
    toString() {
        const stringArray = [];
        let lowercase = false;
        if (this.deep !== 1) {
            lowercase = true;
            if (this.shallow !== 1) {
                if (this.shallow === this.deep) {
                    stringArray.push(this.shallow);
                    lowercase = false;
                }
                else {
                    stringArray.push(this.shallow, "-", this.deep);
                }
            }
            else if (this.deep !== 2) {
                stringArray.push(this.deep);
            }
        }
        if (lowercase) {
            stringArray.push(this.face.toLowerCase());
        }
        else {
            stringArray.push(this.face);
        }
        if (Math.abs(this.amount) !== 1) {
            stringArray.push(Math.abs(this.amount));
        }
        if (this.amount < 0) {
            stringArray.push("'");
        }
        return stringArray.join("");
    }
    forwardIterator() {
        return new MoveIterator(this);
    }
    reverseIterator() {
        return new MoveIterator(this, true);
    }
    forward() {
        return { [Symbol.iterator]: () => this.forwardIterator() };
    }
    reverse() {
        return { [Symbol.iterator]: () => this.reverseIterator() };
    }
    [Symbol.iterator]() {
        return this.forwardIterator();
    }
}
export class Commutator {
    constructor(algA, algB) {
        this.amount = 1;
        this.algA = algA;
        this.algB = algB;
    }
    copy() {
        return new Commutator(this.algA.copy(), this.algB.copy());
    }
    expand() {
        const expandedA = this.algA.expand();
        const expandedB = this.algB.expand();
        const invertedA = [];
        const invertedB = [];
        for (let i = expandedA.length - 1; i >= 0; i--) {
            const move = expandedA[i];
            invertedA.push(new Move(move.face, move.shallow, move.deep, -move.amount));
        }
        for (let i = expandedB.length - 1; i >= 0; i--) {
            const move = expandedB[i];
            invertedB.push(new Move(move.face, move.shallow, move.deep, -move.amount));
        }
        return expandedA.concat(expandedB, invertedA, invertedB);
    }
    invert() {
        let swap = this.algA;
        this.algA = this.algB;
        this.algB = swap;
        return this;
    }
    inverted() {
        return new Commutator(this.algB.copy(), this.algA.copy());
    }
    toString() {
        return `[${this.algA.toString()}, ${this.algB.toString()}]`;
    }
    forwardIterator() {
        return new CommutatorIterator(this);
    }
    reverseIterator() {
        return new CommutatorIterator(this, true);
    }
    forward() {
        return { [Symbol.iterator]: () => this.forwardIterator() };
    }
    reverse() {
        return { [Symbol.iterator]: () => this.reverseIterator() };
    }
    [Symbol.iterator]() {
        return this.forwardIterator();
    }
}
export class Conjugate {
    constructor(algA, algB) {
        this.amount = 1;
        this.algA = algA;
        this.algB = algB;
    }
    copy() {
        return new Conjugate(this.algA.copy(), this.algB.copy());
    }
    expand() {
        const expandedA = this.algA.expand();
        const expandedB = this.algB.expand();
        const invertedA = [];
        for (let i = expandedA.length - 1; i >= 0; i--) {
            const move = expandedA[i];
            invertedA.push(new Move(move.face, move.shallow, move.deep, -move.amount));
        }
        return expandedA.concat(expandedB, invertedA);
    }
    invert() {
        this.algB.invert();
        return this;
    }
    inverted() {
        return new Conjugate(this.algA.copy(), this.algB.inverted());
    }
    toString() {
        return `[${this.algA.toString()} : ${this.algB.toString()}]`;
    }
    forwardIterator() {
        return new ConjugateIterator(this);
    }
    reverseIterator() {
        return new ConjugateIterator(this, true);
    }
    forward() {
        return { [Symbol.iterator]: () => this.forwardIterator() };
    }
    reverse() {
        return { [Symbol.iterator]: () => this.reverseIterator() };
    }
    [Symbol.iterator]() {
        return this.forwardIterator();
    }
}
export class Comment {
    constructor(comment, type) {
        this.amount = 0;
        this.value = comment;
        this.type = type;
    }
    copy() { return new Comment(this.value, this.type); }
    expand() { return []; }
    invert() { return this; }
    inverted() { return this.copy(); }
    toString() {
        if (this.type === "lineComment") {
            return `//${this.value}`;
        }
        return `/*${this.value}*/`;
    }
    forwardIterator() {
        return new EmptyIterator();
    }
    reverseIterator() {
        return new EmptyIterator();
    }
    forward() {
        return { [Symbol.iterator]: () => this.forwardIterator() };
    }
    reverse() {
        return { [Symbol.iterator]: () => this.reverseIterator() };
    }
    [Symbol.iterator]() {
        return this.forwardIterator();
    }
}
export class Whitespace {
    constructor(whitespace) {
        this.amount = 0;
        this.value = whitespace;
    }
    copy() { return new Whitespace(this.value); }
    expand() { return []; }
    invert() { return this; }
    inverted() { return this.copy(); }
    toString() { return this.value; }
    forwardIterator() {
        return new EmptyIterator();
    }
    reverseIterator() {
        return new EmptyIterator();
    }
    forward() {
        return { [Symbol.iterator]: () => this.forwardIterator() };
    }
    reverse() {
        return { [Symbol.iterator]: () => this.reverseIterator() };
    }
    [Symbol.iterator]() {
        return this.forwardIterator();
    }
}
export class Alg {
    constructor(nodes) {
        this.amount = 1;
        this.nodes = nodes;
    }
    static fromString(moveString) {
        return Alg.parseSiGN(moveString);
    }
    copy() {
        const copiedNodes = [];
        for (const node of this.nodes) {
            copiedNodes.push(node.copy());
        }
        return new Alg(copiedNodes);
    }
    expand() {
        const moves = [];
        for (const node of this.nodes) {
            moves.push(...node.expand());
        }
        return moves;
    }
    expanded() {
        return new Alg(this.expand());
    }
    invert() {
        const invertedNodes = [];
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            this.nodes[i].invert();
            invertedNodes.push(this.nodes[i]);
        }
        this.nodes = invertedNodes;
        return this;
    }
    inverted() {
        return this.copy().invert();
    }
    toString() {
        const stringArray = [];
        for (const node of this.nodes) {
            stringArray.push(node.toString());
        }
        if (this.amount === 1) {
            return stringArray.join("");
        }
        return `(${stringArray.join("")})${this.amount}`;
    }
    forwardIterator() {
        return new AlgIterator(this);
    }
    reverseIterator() {
        return new AlgIterator(this, true);
    }
    forward() {
        return { [Symbol.iterator]: () => this.forwardIterator() };
    }
    reverse() {
        return { [Symbol.iterator]: () => this.reverseIterator() };
    }
    [Symbol.iterator]() {
        return this.forwardIterator();
    }
    static tokensToAlg(tokens, amount) {
        let alg = new Alg([]);
        alg.amount = amount ?? 1;
        let nodes = alg.nodes;
        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            switch (token.type) {
                case "move":
                    const move = Move.fromString(token.value);
                    if (move !== null) {
                        nodes.push(move);
                    }
                    break;
                case "punctuation":
                    switch (token.value) {
                        case ",":
                        case ":":
                            const constructor = (token.value === ",") ? Commutator : Conjugate;
                            const group = new constructor(alg, new Alg([]));
                            const amount = alg.amount;
                            alg.amount = 1;
                            alg = new Alg([group]);
                            alg.amount = amount;
                            nodes = group.algB.nodes;
                            break;
                        case "[":
                        case "(":
                            let neededClosingBrackets = 1;
                            for (let j = i + 1; j < tokens.length; j++) {
                                if ("])".indexOf(tokens[j].value) > -1) {
                                    neededClosingBrackets--;
                                    if (neededClosingBrackets === 0) {
                                        nodes.push(Alg.tokensToAlg(tokens.slice(i + 1, j), tokens[j].amount));
                                        i = j;
                                        token = tokens[j];
                                        break;
                                    }
                                }
                                else if ("([".indexOf(tokens[j].value) > -1) {
                                    neededClosingBrackets++;
                                }
                            }
                            break;
                        case "]":
                        case ")":
                            throw "Unmatched ']' or ')'.";
                    }
                    break;
                case "blockComment":
                case "lineComment":
                    nodes.push(new Comment(token.value, token.type));
                    break;
                case "whitespace":
                    nodes.push(new Whitespace(token.value));
                    break;
                default:
                    throw `Invalid token type: ${token.type}.`;
            }
        }
        return alg;
    }
    static preParseSiGNValidation(tokens) {
        const invertBracket = (bracket) => {
            switch (bracket) {
                case "[": return "]";
                case "]": return "[";
                case ")": return "(";
                case "(": return ")";
                default: throw `String '${bracket}' is not a valid bracket.`;
            }
        };
        let brackets = [];
        for (const token of tokens) {
            const value = token.value;
            if (token.type === "punctuation" && "[]()".indexOf(value) > -1) {
                if (value === ")" || value === "]") {
                    if (brackets[brackets.length - 1] !== invertBracket(value)) {
                        return `Closing bracket '${value}' does not match opening bracket '${brackets[brackets.length - 1]}'.`;
                    }
                    brackets.pop();
                }
                else {
                    brackets.push(value);
                }
            }
        }
        if (brackets.length !== 0) {
            return `'${brackets[brackets.length - 1]}' missing closing bracket.`;
        }
        return "";
    }
    static parseSiGN(moveString) {
        const tokens = SiGNTokens(moveString);
        const validation = Alg.preParseSiGNValidation(tokens);
        if (validation) {
            throw validation;
        }
        return Alg.tokensToAlg(tokens);
    }
}
