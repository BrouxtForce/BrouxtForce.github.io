import { SiGNTokens, SiGNToken, SiGNTokenInputStream } from "./sign-tokens.js";
import { MoveIterator, CommutatorIterator, ConjugateIterator, AlgIterator, EmptyIterator } from "./alg-iterator.js";

// TODO: Optimization (for both this and sign-tokens.ts)

export interface AlgNode {
    type: string; // Type of AlgNode
    amount: number; // Amount of times the node should be executed. Negative means to invert the node

    copy(): AlgNode; // Returns a deep copy of the AlgNode
    expand(copy: boolean): AlgNode[]; // Expands the node into a (Move | Comment | Whitespace)[], written as AlgNode[] for simplicity
    invert(): AlgNode; // Inverts the AlgNode
    inverted(): AlgNode; // Returns an inverted copy of the AlgNode
    simplify?(): void; // Simplifies the node (Combines and mod 4's moves).
    toString(parent?: boolean): string; // Returns a string representation of the AlgNode. Parameter used internally.

    stripComments?(): void; // (optional) Strips comments from the node
    removeWhitespace?(): void; // (optional) Removes whitespace (except \n's) from the node
    addWhitespace?(): void; // (optional) Adds whitespace where it makes sense to the node

    [Symbol.iterator](): Iterator<any>;
    forwardIterator(): Iterator<any>;
    reverseIterator(): Iterator<any>;
    forward(): { [Symbol.iterator](): Iterator<any> };
    reverse(): { [Symbol.iterator](): Iterator<any> };
}

export class Move implements AlgNode {
    public type = "Move";

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
    expand(copy: boolean): Move[] {
        return copy ? [this] : [this.copy()];
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
    public type = "Commutator";

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
    expand(copy: boolean): AlgNode[] {
        const expandedA = this.algA.expand(copy);
        const expandedB = this.algB.expand(copy);
        const invertedA: AlgNode[] = [];
        const invertedB: AlgNode[] = [];

        // Copy expandedA and expandedB into separate arrays and invert the sequences
        for (let i = expandedA.length - 1; i >= 0; i--) {
            invertedA.push(expandedA[i].inverted());
        }
        for (let i = expandedB.length - 1; i >= 0; i--) {
            invertedB.push(expandedB[i].inverted());
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
        return `[${this.algA.toString()},${this.algB.toString()}]`;
    }
    stripComments(): void {
        this.algA.stripComments();
        this.algB.stripComments();
    }
    removeWhitespace(): void {
        this.algA.removeWhitespace();
        this.algB.removeWhitespace();
    }
    addWhitespace(): void {
        this.algA.addWhitespace();
        this.algB.addWhitespace();
    }
    simplify(): void {
        this.algA.simplify();
        this.algB.simplify();
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
    public type = "Conjugate";

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
    expand(copy: boolean): AlgNode[] {
        const expandedA = this.algA.expand(copy);
        const expandedB = this.algB.expand(copy);
        const invertedA: AlgNode[] = [];

        // Copy expandedA into a separate array and invert its sequence
        for (let i = expandedA.length - 1; i >= 0; i--) {
            invertedA.push(expandedA[i].inverted());
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
        return `[${this.algA.toString()}:${this.algB.toString()}]`;
    }
    stripComments(): void {
        this.algA.stripComments();
        this.algB.stripComments();
    }
    removeWhitespace(): void {
        this.algA.removeWhitespace();
        this.algB.removeWhitespace();
    }
    addWhitespace(): void {
        this.algA.addWhitespace();
        this.algB.addWhitespace();
    }
    simplify(): void {
        this.algA.simplify();
        this.algB.simplify();
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
    public type = "Comment";
    
    public value: string;
    public commentType: "blockComment" | "lineComment";
    public amount = 0; // Does nothing

    constructor(comment: string, commentType: "blockComment" | "lineComment") {
        this.value = comment;
        this.commentType = commentType;
    }
    copy(): Comment { return new Comment(this.value, this.commentType); }
    expand(copy: boolean): Comment[] { return copy ? [this.copy()] : [this]; }
    invert(): Comment { return this; }
    inverted(): Comment { return this.copy(); }
    toString(): string {
        if (this.commentType === "lineComment") {
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
    public type = "Whitespace";

    public value: string;
    public amount = 0;

    constructor(whitespace: string) {
        this.value = whitespace;
    }
    copy(): Whitespace { return new Whitespace(this.value); }
    expand(copy: boolean): Whitespace[] { return copy ? [this.copy()] : [this]; }
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
    public type = "Alg";

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
    expand(copy: boolean = false): AlgNode[] {
        const nodes: AlgNode[] = [];
        if (this.amount > 0) {
            for (const node of this.nodes) {
                nodes.push(...node.expand(copy));
            }
        } else {
            for (let i = this.nodes.length - 1; i >= 0; i--) {
                nodes.push(...this.nodes[i].inverted().expand(copy));
            }
        }

        const repeatedNodesArray: AlgNode[] = [];
        if (copy) {
            for (let i = 0; i < Math.abs(this.amount); i++) {
                let copyArray: AlgNode[] = [];
                for (let j = 0; j < nodes.length; j++) {
                    copyArray[j] = nodes[j].copy();
                }
                repeatedNodesArray.push(...copyArray);
            }
        } else {
            for (let i = 0; i < Math.abs(this.amount); i++) {
                repeatedNodesArray.push(...nodes.slice());
            }
        }

        return repeatedNodesArray;
    }
    expanded(): Alg {
        return new Alg(this.expand());
    }
    invert(): Alg {
        // Invert the nodes
        const invertedNodes = [];
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            this.nodes[i].invert();
            invertedNodes.push(this.nodes[i]);
        }

        // Fix line comment positioning
        for (let i = 0; i < invertedNodes.length; i++) {
            if (invertedNodes[i].type === "Comment") {
                const comment = invertedNodes[i] as Comment;
                if (comment.commentType !== "lineComment") {
                    continue;
                }
                if (i + 1 >= invertedNodes.length || invertedNodes[i + 1].type === "Whitespace") {
                    const whitespace = invertedNodes[i] as Whitespace;
                    if (whitespace.value.indexOf("\n") > -1) {
                        continue;
                    }
                }

                invertedNodes.splice(i, 1);

                let broken = false;
                for (let j = i; j < invertedNodes.length; j++) {
                    if (invertedNodes[j].type === "Whitespace") {
                        const whitespace = invertedNodes[j] as Whitespace;
                        // Whitespace will always start with '\n' after a comment
                        if (whitespace.value[0] === "\n") {
                            broken = true;
                            invertedNodes.splice(j, 0, comment);
                            break;
                        }
                    }
                }
                if (!broken) {
                    invertedNodes.push(comment);
                }
            }
        }

        this.nodes = invertedNodes;
        return this;
    }
    inverted(): Alg {
        return this.copy().invert();
    }
    toString(parent = true): string {
        const stringArray = [];
        for (const node of this.nodes) {
            stringArray.push(node.toString(false));
        }
        if (this.amount === 1 && parent) {
            return stringArray.join("");
        }

        const absAmount = Math.abs(this.amount);
        return `(${stringArray.join("")})${absAmount !== 1 ? absAmount : ""}${this.amount < 0 ? "'" : ""}`;
    }
    stripComments(): void {
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].type === "Comment") {
                this.nodes.splice(i, 1);
                i--;
                continue;
            }
            this.nodes[i].stripComments?.();
        }
    }
    removeWhitespace(removeNewlines = false): void {
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].type === "Whitespace") {
                const whitespace = this.nodes[i] as Whitespace;

                if (removeNewlines || whitespace.value.indexOf("\n") === -1) {
                    this.nodes.splice(i, 1);
                    i--;
                    continue;
                }

                // Regex . is everything but \n (which is quite convenient here)
                whitespace.value = whitespace.value.replace(/./g, "");
                continue;
            }

            this.nodes[i].removeWhitespace?.();
        }
    }
    addWhitespace(): void {
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].addWhitespace?.();

            let type = this.nodes[i].type;
            if (type !== "Whitespace") {
                if (i + 1 >= this.nodes.length) {
                    continue;
                }
                if (this.nodes[i + 1].type !== "Whitespace") {
                    this.nodes.splice(i + 1, 0, new Whitespace(" "));
                    i++;
                }
            }
        }
    }
    simplify(): void {
        let changed = true;
        while (changed) {
            changed = false;

            let prevNode: AlgNode | null = null;
            let prevNodeIndex = -1;
            for (let i = 0; i < this.nodes.length; i++) {
                let node = this.nodes[i];

                // Skip over whitespaces and comments
                if (node.type === "Whitespace" || node.type === "Comment") {
                    continue;
                }

                // Simplify the node
                node.simplify?.();

                // Single move simplifications
                if (node.type === "Move") {
                    if (node.amount % 4 === 0) {
                        this.nodes.splice(i, 1);
                        i--;
                        continue;
                    }
                    node.amount %= 4;
                }

                // Two move simplifications
                if (node.type === "Move" && prevNode?.type === "Move") {
                    if ((node as Move).face === (prevNode as Move).face) {
                        changed = true;

                        prevNode.amount += node.amount;
                        if (node.amount === 0) {
                            this.nodes.splice(prevNodeIndex, 1);
                        }
                        this.nodes.splice(i, 1);

                        i = prevNodeIndex;

                        continue;
                    }
                }

                prevNode = node;
                prevNodeIndex = i;
            }
        }
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

        // Check for uppercase XYZ (illegal)
        for (const token of tokens) {
            if (token.type === "move" && "XYZ".indexOf(token.value) > -1) {
                return `'${token.value}' must be lowercase.`;
            }
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