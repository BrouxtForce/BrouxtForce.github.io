class CharacterInputStream {
    constructor(string) {
        this.string = string;
        this.index = 0;
    }
    peek() {
        return this.string[this.index];
    }
    back() {
        this.index--;
    }
    next() {
        return this.string[this.index++];
    }
    eof() {
        return this.index >= this.string.length;
    }
}
class TokenInputStream {
    constructor(characterInputStream) {
        this.input = characterInputStream;
        this.currentToken = null;
    }
    isDigit(char) {
        return /[0-9]/i.test(char);
    }
    isLetter(char) {
        return /[a-z]/i.test(char);
    }
    isPunctuation(char) {
        return "().*".indexOf(char) !== -1;
    }
    isWhitespace(char) {
        return " \t\n".indexOf(char) !== -1;
    }
    readNumber() {
        return {
            type: "number",
            value: this.readWhile(this.isDigit)
        };
    }
    readSan() {
        let san = this.input.next();
        if (san === "O") {
            san += this.input.next();
            san += this.input.next();
            if (this.input.peek() === "-") {
                san += this.input.next();
                san += this.input.next();
            }
            if ("#+".indexOf(this.input.peek()) !== -1) {
                san += this.input.next();
            }
            return {
                type: "san",
                value: san
            };
        }
        const file = this.input.next();
        if (this.isLetter(this.input.peek()) && this.isLetter(file)) {
            san += file;
        }
        else {
            this.input.back();
        }
        if (this.input.peek() === "x")
            san += this.input.next();
        if (this.isLetter(this.input.peek()))
            san += this.input.next();
        if (this.isDigit(this.input.peek()))
            san += this.input.next();
        if ("#+".indexOf(this.input.peek()) !== -1)
            san += this.input.next();
        return {
            type: "san",
            value: san
        };
    }
    readPunctuation() {
        const next = this.input.next();
        if (next === "." && this.input.peek() === ".") {
            return {
                type: "punctuation",
                value: next + this.readWhile((char) => char === ".")
            };
        }
        return {
            type: "punctuation",
            value: next
        };
    }
    readWhile(predicate) {
        let stringArray = [];
        while (!this.input.eof() && predicate(this.input.peek())) {
            stringArray.push(this.input.next());
        }
        return stringArray.join("");
    }
    readNextToken() {
        if (this.currentToken !== null) {
            const token = this.currentToken;
            this.currentToken = null;
            return token;
        }
        this.readWhile(this.isWhitespace);
        if (this.input.eof())
            return null;
        const char = this.input.peek();
        if (this.isDigit(char)) {
            return this.readNumber();
        }
        else if (this.isLetter(char)) {
            return this.readSan();
        }
        else if (this.isPunctuation(char)) {
            return this.readPunctuation();
        }
        console.error(`Cannot handle character ${char}.`);
        return null;
    }
    PeekNextToken() {
        this.currentToken = this.readNextToken();
        return this.currentToken;
    }
}
export function writePgnToObject(pgn, object, parent = null, move = 0) {
    const tokenStream = new TokenInputStream(new CharacterInputStream(pgn));
    let prevNode = parent;
    let node = object;
    while (true) {
        let token = tokenStream.readNextToken();
        if (token === null)
            break;
        switch (token.type) {
            case "san":
                const san = token.value;
                node[san] = {};
                prevNode = node;
                node = node[san];
                move++;
                break;
            case "punctuation":
                switch (token.value) {
                    case "(":
                        const tokenValues = [];
                        let neededClosedParanthesis = 1;
                        while (true) {
                            const nextToken = tokenStream.readNextToken();
                            if (nextToken === null) {
                                throw "Missing closing parenthesis.";
                            }
                            if (nextToken.type === "punctuation") {
                                if (nextToken.value === "(") {
                                    neededClosedParanthesis++;
                                }
                                else if (nextToken.value === ")") {
                                    neededClosedParanthesis--;
                                    if (neededClosedParanthesis === 0) {
                                        break;
                                    }
                                }
                            }
                            tokenValues.push(nextToken.value);
                        }
                        writePgnToObject(tokenValues.join(""), node, prevNode, move);
                        break;
                    case "...":
                        if (move % 2 === 0) {
                            node = prevNode;
                            move--;
                        }
                        break;
                    case ".":
                        if (move % 2 === 1) {
                            node = prevNode;
                            move--;
                        }
                    case "*":
                        break;
                }
                break;
        }
    }
}
