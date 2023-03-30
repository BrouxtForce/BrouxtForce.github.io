import * as ChessJS from "../../dependencies/chessjs/chess.js";
import { Chessboard2 } from "../../dependencies/chessboard2/dist/chessboard2.min.mjs";
export class Chessboard extends HTMLElement {
    constructor() {
        super();
        this.moves = [];
        this.lastMoveIndex = -1;
        this.userColor = "";
        this.chess = new ChessJS.Chess();
        this.chessboard = this.createChessboard2(this);
        this.addEventListener("resize", () => {
            this.chessboard.resize();
        });
    }
    static get observedAttributes() {
        return ["size"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "size":
                this.style.width = `${newValue}px`;
                this.chessboard.resize();
                break;
        }
    }
    connectedCallback() {
        this.style.display = "block";
        this.style.width = (this.getAttribute("size") ?? "400") + "px";
        this.chessboard.resize();
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/src/dependencies/chessboard2/dist/chessboard2.min.css";
        this.appendChild(link);
    }
    createChessboard2(node) {
        return Chessboard2(node, {
            pieceTheme: "assets/chess-pieces/wikipedia/{piece}.png",
            position: "start",
            draggable: true,
            onDragStart: (dragInfo) => {
                const { piece, square } = dragInfo;
                if (this.gameOver()) {
                    return false;
                }
                if (this.turn()[0] !== piece[0]) {
                    return false;
                }
                if (this.oppositeColor(this.turn()) === this.userColor) {
                    return false;
                }
                const possibleMoves = this.possibleMovesAtSquare(square);
                if (possibleMoves.length === 0) {
                    return false;
                }
                const boardState = this.chessboard.position();
                delete boardState[square];
                this.chessboard.position(boardState, false);
                for (const move of possibleMoves) {
                    let legalSquare = move.to;
                    if (move.flags.search(/^c/) !== -1) {
                        this.chessboard.addCircle({
                            square: legalSquare,
                            opacity: 0.3,
                            color: "red",
                            size: 0.8
                        });
                    }
                    else {
                        this.chessboard.addCircle({
                            square: legalSquare,
                            opacity: 0.3,
                            color: "#333",
                            size: 0.33
                        });
                    }
                }
                return true;
            },
            onDrop: (dropInfo) => {
                const { source, target, piece } = dropInfo;
                const fen = this.chess.fen();
                const successful = this.moveFromTo(source, target);
                this.chessboard.clearCircles();
                if (!successful) {
                    this.chessboard.position(fen, false);
                    return "snapback";
                }
                const boardState = this.chessboard.position();
                boardState[target] = piece;
                this.chessboard.position(boardState, false);
                this.dispatchEvent(new CustomEvent("usermove", { detail: this.moves[this.lastMoveIndex] }));
                window.requestAnimationFrame(() => this.updateBoard());
            }
        });
    }
    gameOver() {
        return this.chess.isGameOver();
    }
    move(san) {
        const move = this.chess.move(san);
        this.chessboard.position(this.chess.fen());
        if (move === null) {
            return false;
        }
        this.recordMove(move.san);
        return true;
    }
    moveFromTo(from, to) {
        let move;
        try {
            move = this.chess.move({
                from: from,
                to: to,
                promotion: "q"
            });
        }
        catch (error) {
            return false;
        }
        this.recordMove(move.san);
        return true;
    }
    possibleMovesAtSquare(square) {
        return this.chess.moves({
            square: square,
            verbose: true
        });
    }
    turn() {
        return this.chess.turn() === "w" ? "white" : "black";
    }
    pgn() {
        return this.chess.pgn();
    }
    fen() {
        return this.chess.fen();
    }
    undo() {
        const move = this.chess.undo();
        if (move === null) {
            return false;
        }
        this.lastMoveIndex--;
        return true;
    }
    redo() {
        const san = this.moves[this.lastMoveIndex + 1];
        if (!san) {
            return false;
        }
        const move = this.chess.move(san);
        if (move === null) {
            return false;
        }
        this.lastMoveIndex++;
        return true;
    }
    updateBoard(animate = true) {
        this.chessboard.position(this.chess.fen(), animate);
        this.dispatchEvent(new CustomEvent("boardupdate"));
    }
    flip() {
        this.chessboard.flip();
    }
    oppositeColor(color) {
        console.assert(color === "white" || color === "black");
        return (color === "white") ? "black" : "white";
    }
    setUserColor(color) {
        this.userColor = color;
    }
    getUserColor() {
        return this.userColor;
    }
    recordMove(san) {
        if (this.lastMoveIndex === this.moves.length - 1) {
            this.moves.push(san);
            this.lastMoveIndex++;
            return;
        }
        if (san === this.moves[this.lastMoveIndex + 1]) {
            this.lastMoveIndex++;
            return;
        }
        this.moves.splice(this.lastMoveIndex + 1, Infinity, san);
        this.lastMoveIndex++;
    }
    getMoves() {
        return this.moves.slice(0, this.lastMoveIndex + 1);
    }
    resetBoard() {
        this.chess.reset();
        this.updateBoard();
    }
    clearBoard() {
        this.moves.length = 0;
        this.lastMoveIndex = -1;
        this.chess.clear();
        this.updateBoard();
    }
    placePiece(pieceType, square, color) {
        const successful = this.chess.put({
            type: pieceType,
            color: color[0]
        }, square);
        this.updateBoard();
        return successful;
    }
    getPieceOnSquare(square) {
        return this.chess.get(square);
    }
}
customElements.define("chess-board", Chessboard);
