export class CharacterInputStream {
    constructor(input) {
        this.pos = 0;
        this.line = 1;
        this.col = 0;
        this.input = input;
    }
    next() {
        let char = this.input.charAt(this.pos);
        this.pos++;
        if (char === "\n") {
            this.line++;
            this.col = 0;
        }
        else {
            this.col++;
        }
        return char;
    }
    peek() {
        return this.input.charAt(this.pos);
    }
    eof() {
        return this.peek() === "";
    }
    croak(message) {
        throw `Error Ln ${this.line} Col ${this.col}: ${message}`;
    }
}
export class SiGNTokenInputStream {
    constructor(input) {
        this.input = new CharacterInputStream(input);
    }
    isWhitespace(char) {
        return " \t\n".indexOf(char) > -1;
    }
    isPunctuation(char) {
        return "[](),:".indexOf(char) > -1;
    }
    isMove(char) {
        return "ufrbldmesxyz".indexOf(char.toLowerCase()) > -1;
    }
    isNumber(char) {
        return "0123456789".indexOf(char) > -1;
    }
    isForwardSlash(char) {
        return char === "/";
    }
    readWhile(func) {
        let stringArray = [];
        while (!this.input.eof() && func(this.input.peek())) {
            stringArray.push(this.input.next());
        }
        return stringArray.join("");
    }
    readNumber() {
        return this.readWhile(this.isNumber);
    }
    readMove() {
        let move = "";
        if (this.isNumber(this.input.peek())) {
            move += this.readNumber();
        }
        if (this.input.peek() === "-") {
            move += this.input.next();
            move += this.readNumber();
        }
        move += this.input.next();
        let char = this.input.peek();
        if (this.isNumber(char)) {
            move += this.readNumber();
            if (this.input.peek() === "'") {
                move += this.input.next();
            }
            return move;
        }
        switch (char) {
            case "w":
                if ("UFRBLD".indexOf(move[move.length - 1]) === -1) {
                    this.input.croak("Invalid move before 'w'");
                }
                move += this.input.next();
                if (this.isNumber(this.input.peek())) {
                    move += this.readNumber();
                }
                if (this.input.peek() === "'") {
                    move += this.input.next();
                }
                return move;
            case "'":
                return move + this.input.next();
        }
        return move;
    }
    readPunc() {
        return this.input.next();
    }
    skipComment() {
        this.input.next();
        if (this.input.peek() === "/") {
            this.readWhile((char) => char !== "\n");
            return;
        }
        if (this.input.peek() === "*") {
            let prevChar = "";
            let char = "";
            let requiredClosingComments = 1;
            while (!this.input.eof()) {
                char = this.input.next();
                if (char === "*") {
                    if (prevChar === "/") {
                        requiredClosingComments++;
                    }
                    else if (this.input.peek() === "/") {
                        requiredClosingComments--;
                        if (requiredClosingComments === 0) {
                            this.input.next();
                            return;
                        }
                    }
                }
                prevChar = char;
            }
            this.input.croak("Syntax Error: Missing end to multi-line comment.");
            return;
        }
        this.input.croak("Syntax Error: Random forward slash.");
    }
    readNext() {
        while (true) {
            this.readWhile(this.isWhitespace);
            if (this.input.eof()) {
                return null;
            }
            let char = this.input.peek();
            if (this.isMove(char) || this.isNumber(char)) {
                return {
                    type: "move",
                    value: this.readMove()
                };
            }
            if (this.isPunctuation(char)) {
                let token = {
                    type: "punctuation",
                    value: this.readPunc()
                };
                if ((this.isNumber(this.input.peek()) || this.input.peek() === "'") && (token.value === ")" || token.value === "]")) {
                    token.amount = Number.parseInt(this.readNumber());
                    if (isNaN(token.amount)) {
                        token.amount = 1;
                    }
                    if (this.input.peek() === "'") {
                        this.input.next();
                        token.amount *= -1;
                    }
                }
                return token;
            }
            if (this.isForwardSlash(char)) {
                this.skipComment();
                continue;
            }
            this.input.croak(`Syntax Error: ${char}`);
        }
    }
}
export function SiGNTokens(moveString) {
    let stream = new SiGNTokenInputStream(moveString);
    let tokenArray = [];
    while (true) {
        let token = stream.readNext();
        if (token === null) {
            break;
        }
        tokenArray.push(token);
    }
    return tokenArray;
}
