import { SiGNTokens, SiGNToken, SiGNTokenInputStream } from "./sign-tokens.js";
import { MoveIterator, CommutatorIterator, ConjugateIterator, AlgIterator, EmptyIterator } from "./alg-iterator.js";

// TODO: Optimization (for both this and sign-tokens.ts)

export interface AlgNode {
    amount: number; // Amount of times the node should be executed. Negative means to invert the node

    copy(): AlgNode; // Returns a deep copy of the AlgNode
    expand(): Move[]; // Expands the node into a pure Move() array
    invert(): AlgNode; // Inverts the AlgNode
    inverted(): AlgNode; // Returns an inverted copy of the AlgNode
    toString(): string; // Returns a string representation of the AlgNode

    [Symbol.iterator](): Iterator<any>;
    forwardIterator(): Iterator<any>;
    reverseIterator(): Iterator<any>;
    forward(): { [Symbol.iterator](): Iterator<any> };
    reverse(): { [Symbol.iterator](): Iterator<any> };
}

export class Move implements AlgNode {
    public face: string;
    public shallow: number = 1;
    public deep: number = 1;
    public amount: number; // Negative for counterclockwise turns

    constructor(face: string, shallow: number, deep: number, amount: number) {
        this.face = face;
        this.shallow = shallow;
        this.deep = deep;
        this.amount = amount;
    }
    // Move.fromString() is strict, requiring proper move notation without a single extra character
    // TODO: Validation and errors
    static fromString(moveString: string): Move | null {
        let face: string, shallow: number = 1, deep: number = 1, amount: number = 1;

        const stream = new SiGNTokenInputStream(moveString);

        let char = stream.input.peek();

        // Wide layer turns
        if (stream.isNumber(char)) {
            deep = Number.parseInt(stream.readNumber());

            if (stream.input.peek() === "-") {
                stream.input.next();
                let newDeep = Number.parseInt(stream.readNumber());
                shallow = deep;
                deep = newDeep;
            }
        }

        // Face letter
        face = stream.input.next();

        // Ex: 2R is 2-2r, so shallow and deep should both be 2. Check against 'w' because 2Rw != 2-2r
        if (face === face.toUpperCase() && stream.input.peek() !== "w" && deep !== 1) {
            shallow = deep;
        }

        // Implicitly 2w
        if (stream.input.peek() === "w" || face === face.toLowerCase()) {
            // If 'deep' is already defined, overwriting it would be problematic
            if (deep === 1) {
                deep = 2;
            }
        }

        // Face letter should be forced uppercase if it's UFRBLD
        if ("UFRBLD".indexOf(face.toUpperCase()) !== -1) {
            face = face.toUpperCase();
        }

        // Skip over 'w'
        if (stream.input.peek() === "w") {
            stream.input.next();
        }

        // Turn amount
        if (stream.isNumber(stream.input.peek()) && !stream.input.eof()) {
            amount = Number.parseInt(stream.readNumber());
        }

        // Check for inverse
        if (stream.input.peek() === "'") {
            stream.input.next();
            amount *= -1;
        }

        // Big number error handling
        if (!Number.isSafeInteger(shallow) || !Number.isSafeInteger(deep) || !Number.isSafeInteger(amount)) {
            throw `Number too large to have precise behavior.`;
        }

        if ("UFRBLDMESmesxyz".indexOf(face) === -1 ||
            face.length !== 1 ||
            shallow > deep ||
            shallow < 1
        ) {
            return null;
        }

        return new Move(face, shallow, deep, amount);
    }

    copy(): Move {
        return new Move(this.face, this.shallow, this.deep, this.amount);
    }
    expand(): Move[] {
        return [this.copy()];
    }
    invert(): Move {
        this.amount *= -1;
        return this;
    }
    inverted(): Move {
        return new Move(this.face, this.shallow, this.deep, -this.amount);
    }
    toString(): string {
        const stringArray: (string | number)[] = [];

        let lowercase = false; // Defines whether the face turn (ex: 'F"') should be lowercase

        // Wide layer
        if (this.deep !== 1) {
            lowercase = true;

            // Ex: 2-5
            // If shallow isn't one, deep also cannot be one (otherwise the move wouldn't do anything)
            if (this.shallow !== 1) {
                // If shallow == deep, and 2-2r == 2R, then we should output 2R for simplicity
                if (this.shallow === this.deep) {
                    stringArray.push(this.shallow);
                    lowercase = false;
                } else {
                    stringArray.push(this.shallow, "-", this.deep);
                }
            }

            // r is implicitly 2r, skip if deep == 2
            else if (this.deep !== 2) {
                stringArray.push(this.deep);
            }
        }

        // Face (TODO: Add option for both 'w' and lowercase face)
        if (lowercase) {
            stringArray.push(this.face.toLowerCase());
        } else {
            stringArray.push(this.face);
        }

        // Turn amount
        if (Math.abs(this.amount) !== 1) {
            stringArray.push(Math.abs(this.amount));
        }
        if (this.amount < 0) {
            stringArray.push("'");
        }

        return stringArray.join("");
        // return `${this.face}${((this.wide !== 1) ? "w" + this.wide : "")}${Math.abs(this.amount)}${(this.amount > 0) ? "" : "'"}`;
    }

    forwardIterator(): MoveIterator {
        return new MoveIterator(this);
    }
    reverseIterator(): MoveIterator {
        return new MoveIterator(this, true);
    }
    forward() {
        return { [Symbol.iterator]: () => this.forwardIterator() };
    }
    reverse() {
        return { [Symbol.iterator]: () => this.reverseIterator() };
    }
    [Symbol.iterator](): MoveIterator {
        // return new MoveIterator(this);
        return this.forwardIterator();
    }
}

export class Commutator implements AlgNode {
    public algA: Alg;
    public algB: Alg;

    public amount: number = 1;

    constructor(algA: Alg, algB: Alg) {
        this.algA = algA;
        this.algB = algB;
    }

    copy(): Commutator {
        return new Commutator(this.algA.copy(), this.algB.copy());
    }
    expand(): Move[] {
        const expandedA = this.algA.expand();
        const expandedB = this.algB.expand();
        const invertedA: Move[] = [];
        const invertedB: Move[] = [];

        // Copy expandedA and expandedB into separate arrays and invert the sequences
        for (let i = expandedA.length - 1; i >= 0; i--) {
            const move = expandedA[i];
            invertedA.push(new Move(move.face, move.shallow, move.deep, -move.amount));
        }
        for (let i = expandedB.length - 1; i >= 0; i--) {
            const move = expandedB[i];
            invertedB.push(new Move(move.face, move.shallow, move.deep, -move.amount));
        }

        // Return the concatenated arrays in order of A B A' B'
        return expandedA.concat(expandedB, invertedA, invertedB);
    }
    invert(): Commutator {
        let swap = this.algA;
        this.algA = this.algB;
        this.algB = swap;
        return this;
    }
    inverted(): Commutator {
        return new Commutator(this.algB.copy(), this.algA.copy());
    }
    toString(): string {
        return `[${this.algA.toString()}, ${this.algB.toString()}]`;
    }

    forwardIterator(): CommutatorIterator {
        return new CommutatorIterator(this);
    }
    reverseIterator(): CommutatorIterator {
        return new CommutatorIterator(this, true);
    }
    forward() {
        return { [Symbol.iterator]: () => this.forwardIterator() };
    }
    reverse() {
        return { [Symbol.iterator]: () => this.reverseIterator() }
    }
    [Symbol.iterator](): CommutatorIterator {
        // if (this.amount < 0) {
        //     this.amount *= -1;
        //     this.invert();
        // }
        // return new CommutatorIterator(this);
        return this.forwardIterator();
    }
}

export class Conjugate implements AlgNode {
    public algA: Alg;
    public algB: Alg;

    public amount: number = 1;

    constructor(algA: Alg, algB: Alg) {
        this.algA = algA;
        this.algB = algB;
    }

    copy(): Conjugate {
        return new Conjugate(this.algA.copy(), this.algB.copy());
    }
    expand(): Move[] {
        const expandedA = this.algA.expand();
        const expandedB = this.algB.expand();
        const invertedA: Move[] = [];

        // Copy expandedA into a separate array and invert its sequence
        for (let i = expandedA.length - 1; i >= 0; i--) {
            const move = expandedA[i];
            invertedA.push(new Move(move.face, move.shallow, move.deep, -move.amount));
        }

        // Return the concatenated arrays in order of A B A'
        return expandedA.concat(expandedB, invertedA);
    }
    invert(): Conjugate {
        this.algB.invert();
        return this;
    }
    inverted(): Conjugate {
        return new Conjugate(this.algA.copy(), this.algB.inverted());
    }
    toString(): string {
        return `[${this.algA.toString()} : ${this.algB.toString()}]`;
    }

    forwardIterator(): ConjugateIterator {
        return new ConjugateIterator(this);
    }
    reverseIterator(): ConjugateIterator {
        return new ConjugateIterator(this, true);
    }
    forward() {
        return { [Symbol.iterator]: () => this.forwardIterator() };
    }
    reverse() {
        return { [Symbol.iterator]: () => this.reverseIterator() };
    }
    [Symbol.iterator](): ConjugateIterator {
        // if (this.amount < 0) {
        //     this.amount *= -1;
        //     this.invert();
        // }
        return this.forwardIterator();
    }
}

export class Comment implements AlgNode {
    public value: string;
    public type: "blockComment" | "lineComment";
    public amount = 0; // Does nothing

    constructor(comment: string, type: "blockComment" | "lineComment") {
        this.value = comment;
        this.type = type;
    }
    copy(): Comment { return new Comment(this.value, this.type); }
    expand(): Move[] { return []; }
    invert(): Comment { return this; }
    inverted(): Comment { return this.copy(); }
    toString(): string {
        if (this.type === "lineComment") {
            return `//${this.value}`;
        }
        return `/*${this.value}*/`;
    }

    forwardIterator(): Iterator<any> {
        return new EmptyIterator();
    }
    reverseIterator(): Iterator<any> {
        return new EmptyIterator();
    }
    forward() {
        return { [Symbol.iterator]: () => this.forwardIterator() }
    }
    reverse() {
        return { [Symbol.iterator]: () => this.reverseIterator() }
    }
    [Symbol.iterator](): Iterator<any> {
        return this.forwardIterator();
    }
}

export class Whitespace implements AlgNode {
    public value: string;
    public amount = 0;

    constructor(whitespace: string) {
        this.value = whitespace;
    }
    copy(): Whitespace { return new Whitespace(this.value); }
    expand(): Move[] { return []; }
    invert(): Whitespace { return this; }
    inverted(): Whitespace { return this.copy(); }
    toString(): string { return this.value; }

    forwardIterator(): Iterator<any> {
        return new EmptyIterator();
    }
    reverseIterator(): Iterator<any> {
        return new EmptyIterator();
    }
    forward() {
        return { [Symbol.iterator]: () => this.forwardIterator() };
    }
    reverse() {
        return { [Symbol.iterator]: () => this.reverseIterator() };
    }
    [Symbol.iterator](): Iterator<any> {
        return this.forwardIterator();
    }
}

export class Alg implements AlgNode {
    public nodes: AlgNode[];

    public amount: number = 1;

    constructor(nodes: AlgNode[]) {
        this.nodes = nodes;
    }
    static fromString(moveString: string): Alg {
        return Alg.parseSiGN(moveString);
    }

    copy(): Alg {
        const copiedNodes = [];
        for (const node of this.nodes) {
            copiedNodes.push(node.copy());
        }
        return new Alg(copiedNodes);
    }
    expand(): Move[] {
        const moves: Move[] = [];
        for (const node of this.nodes) {
            moves.push(...node.expand());
        }
        return moves;
    }
    expanded(): Alg {
        return new Alg(this.expand());
    }
    invert(): Alg {
        const invertedNodes = [];
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            this.nodes[i].invert();
            invertedNodes.push(this.nodes[i]);
        }
        this.nodes = invertedNodes;
        return this;
    }
    inverted(): Alg {
        return this.copy().invert();
    }
    toString(): string {
        const stringArray = [];
        for (const node of this.nodes) {
            stringArray.push(node.toString());
        }
        if (this.amount === 1) {
            return stringArray.join("");
        }
        return `(${stringArray.join("")})${this.amount}`;
    }

    forwardIterator(): AlgIterator {
        return new AlgIterator(this);
    }
    reverseIterator(): AlgIterator {
        return new AlgIterator(this, true);
    }
    forward() {
        return { [Symbol.iterator]: () => this.forwardIterator() };
    }
    reverse() {
        return { [Symbol.iterator]: () => this.reverseIterator() };
    }
    [Symbol.iterator](): AlgIterator {
        // if (this.amount < 0) {
        //     this.amount *= -1;
        //     this.invert();
        // }
        // return new AlgIterator(this);
        return this.forwardIterator();
    }

    private static tokensToAlg(tokens: SiGNToken[], amount?: number): Alg {
        let alg = new Alg([]);
        alg.amount = amount ?? 1;
        let nodes: AlgNode[] = alg.nodes;

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
                        // case "'":
                        //     const prevNode = nodes[nodes.length - 1];
                        //     prevNode.amount *= -1;
                        //     break;
                        case ",": case ":":
                            // TODO: This is black magic. Pls insert comments to explain.
                            const constructor: typeof Commutator | typeof Conjugate = (token.value === ",") ? Commutator : Conjugate;

                            const group = new constructor(alg, new Alg([]));
                            const amount = alg.amount;
                            alg.amount = 1;
                            alg = new Alg([group]);
                            alg.amount = amount;
                            nodes = group.algB.nodes;
                            break;
                        case "[": case "(":
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
                                } else if ("([".indexOf(tokens[j].value) > -1) {
                                    neededClosingBrackets++;
                                }
                            }
                            break;
                        case "]": case ")":
                            throw "Unmatched ']' or ')'.";
                    }
                    break;
                case "blockComment": case "lineComment":
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

    private static preParseSiGNValidation(tokens: SiGNToken[]): string {
        // Helper function
        const invertBracket = (bracket: string) => {
            switch (bracket) {
                case "[": return "]";
                case "]": return "[";
                case ")": return "(";
                case "(": return ")";
                default: throw `String '${bracket}' is not a valid bracket.`;
            }
        };
        
        // Check for matching [] and ()
        let brackets: string[] = [];
        for (const token of tokens) {
            const value = token.value;
            if (token.type === "punctuation" && "[]()".indexOf(value) > -1) {
                if (value === ")" || value === "]") {
                    if (brackets[brackets.length - 1] !== invertBracket(value)) {
                        return `Closing bracket '${value}' does not match opening bracket '${brackets[brackets.length - 1]}'.`;
                    }
                    brackets.pop();
                } else {
                    brackets.push(value);
                }
            }
        }
        if (brackets.length !== 0) {
            return `'${brackets[brackets.length - 1]}' missing closing bracket.`;
        }

        return "";
    }

    private static parseSiGN(moveString: string): Alg {
        const tokens = SiGNTokens(moveString);

        // TODO: Input validation (checking for the same amount of open/close brackets, etc) for better error messages
        const validation = Alg.preParseSiGNValidation(tokens)
        if (validation) {
            throw validation;
        }

        return Alg.tokensToAlg(tokens);
    }
}