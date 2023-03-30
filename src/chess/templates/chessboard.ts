import * as ChessJS from "../../dependencies/chessjs/chess.js"
import { Chessboard2 } from "../../dependencies/chessboard2/dist/chessboard2.min.mjs"

export type ChessColor = "white" | "black";
export type ChessSquare = ChessJS.Square;
export type ChessPieceSymbol = ChessJS.PieceSymbol;
export type ChessPiece = ChessJS.Piece;
export type ChessMove = ChessJS.Move;

// (Incomplete) function definitions for Chessboard2
interface Chessboard2 {
    addCircle(square: ChessSquare): void;
    addCircle(options: { color: string, square: ChessSquare, opacity: number, size: number }): void;
    clear(useAnimation: boolean): void;
    clearCircles(): void;
    destroy(): void;
    fen(): string;
    flip(): void;
    move(...moves: string[]): any;
    position(): any;
    position(fen: string): any;
    position(newPosition: any | string, useAnimation: boolean): void;
    orientation(): any;
    orientation(side: "white" | "black" | "flip"): void;
    resize(): void;
    start(useAnimation: boolean): void;
}

export class Chessboard extends HTMLElement {
    private chessboard: Chessboard2;

    private userColor: ChessColor | "";
    private chess: ChessJS.Chess;
    
    public lastMoveIndex: number;
    public moves: string[];

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
    static get observedAttributes(): string[] {
        return ["size"];
    }
    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
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

        // Load the CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/src/dependencies/chessboard2/dist/chessboard2.min.css";
        this.appendChild(link);
    }

    private createChessboard2(node: HTMLElement): Chessboard2 {
        return Chessboard2(node, {
            pieceTheme: "assets/chess-pieces/wikipedia/{piece}.png",
            position: "start",
            draggable: true,
            onDragStart: (dragInfo: { orientation: ChessColor, piece: string, position: any, square: ChessSquare }) => {      
                const { piece, square } = dragInfo;
                
                // Do not pick up piece if the game is over
                if (this.gameOver()) {
                    return false;
                }

                // Only pick up pieces for the side to move
                if (this.turn()[0] !== piece[0]) {
                    return false;
                }

                // Only pick up pieces if it is the user's turn
                if (this.oppositeColor(this.turn()) === this.userColor) {
                    return false;
                }

                // Generate possible moves
                const possibleMoves = this.possibleMovesAtSquare(square);

                // Do not pick up piece if there are no possible moves
                if (possibleMoves.length === 0) {
                    return false;
                }

                // Remove the piece from the board (currently Chessboard2 keeps a duplicate on the board
                //  when you pick it up, which is not what I want)
                const boardState = this.chessboard.position();
                delete boardState[square];
                this.chessboard.position(boardState, false);

                // Circle legal squares
                for (const move of possibleMoves) {
                    let legalSquare = move.to;

                    // Capture
                    if (move.flags.search(/^c/) !== -1) {
                        this.chessboard.addCircle({
                            square: legalSquare,
                            opacity: 0.3,
                            color: "red",
                            size: 0.8
                        });
                        
                        // All non-capture legal moves
                    } else {
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
            onDrop: (dropInfo: { orientation: ChessColor, piece: string, source: ChessSquare, target: ChessSquare, x: number, y: number }) => {
                const { source, target, piece } = dropInfo;

                // Store the current fen, then make the move
                const fen = this.chess.fen();
                const successful = this.moveFromTo(source, target);

                // Clear legal square circles
                this.chessboard.clearCircles();
                
                // Illegal move
                if (!successful) {
                    this.chessboard.position(fen, false);
                    return "snapback";
                }

                // Instantly move the dragged piece to position
                const boardState = this.chessboard.position();
                boardState[target] = piece;
                this.chessboard.position(boardState, false);
                
                this.dispatchEvent(new CustomEvent("usermove", { detail: this.moves[this.lastMoveIndex] }));
                
                // Animate any other movements:
                // onSnapEnd doesn't get called when I want it to anymore, so I have to
                //  resort to requestAnimationFrame because doing it now would look weird
                window.requestAnimationFrame(() => this.updateBoard());
            }
        }) as Chessboard2;
    }

    // Returns true if the game is over, false otherwise
    gameOver(): boolean {
        return this.chess.isGameOver();
    }

    // Make a move notated in Standard Algebraic Notation (SAN). Returns true if successful, false otherwise
    move(san: string): boolean {
        const move = this.chess.move(san);
        this.chessboard.position(this.chess.fen());
        if (move === null) {
            return false;
        }

        // Add the move to move history
        this.recordMove(move.san);

        return true;
    }

    // Move a piece from a position to a position. Returns true if successful, false otherwise
    moveFromTo(from: ChessSquare, to: ChessSquare): boolean {
        let move: ChessMove;
        try {
            move = this.chess.move({
                from: from,
                to: to,
                promotion: "q" // Promote to queen because I'm lazy
            });
        } catch (error) {
            return false;
        }

        // Add the move to move history
        this.recordMove(move.san);

        return true;
    }

    // Generate the possible moves of a piece at a certain square
    possibleMovesAtSquare(square: ChessSquare): ChessMove[] {
        return this.chess.moves({
            square: square,
            verbose: true
        });
    }

    // Return "white" if white's turn, "black" otherwise
    turn(): ChessColor {
        return this.chess.turn() === "w" ? "white" : "black";
    }

    // Get full chess game in PGN (portable game notation) format
    pgn(): string {
        return this.chess.pgn();
    }

    // Get the FEN representation of the board state
    fen(): string {
        return this.chess.fen();
    }

    // Undo last move. Returns true if successful, false otherwise
    undo(): boolean {
        const move = this.chess.undo();
        if (move === null) {
            return false;
        }
        this.lastMoveIndex--;

        return true;
    }

    // Redo last undid move. Returns true if successful, false otherwise
    redo(): boolean {
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

    // Update the chessboard
    updateBoard(animate: boolean = true): void {
        this.chessboard.position(this.chess.fen(), animate);
        this.dispatchEvent(new CustomEvent("boardupdate"));
    }

    // Flip the board
    flip(): void {
        this.chessboard.flip();
    }

    // Returns the opposite color passed in
    oppositeColor(color: ChessColor): ChessColor {
        console.assert(color === "white" || color === "black");
        return (color === "white") ? "black" : "white";
    }

    // Set the user color
    setUserColor(color: ChessColor | ""): void {
        this.userColor = color;
    }

    // Get the user color
    getUserColor(): ChessColor | "" {
        return this.userColor;
    }

    // Record move and handle important edge cases
    recordMove(san: string): void {
        if (this.lastMoveIndex === this.moves.length - 1) {
            this.moves.push(san);
            this.lastMoveIndex++;
            return;
        }

        if (san === this.moves[this.lastMoveIndex + 1]) {
            this.lastMoveIndex++;
            return;
        }

        // Delete everything in the array after (this.lastMoveIndex + 1), then add (san) to the array
        this.moves.splice(this.lastMoveIndex + 1, Infinity, san);
        this.lastMoveIndex++;
    }

    // Gets the moves previously played on the board
    getMoves(): string[] {
        return this.moves.slice(0, this.lastMoveIndex + 1);
    }

    // Board editing
    resetBoard(): void {
        this.chess.reset();
        this.updateBoard();
    }

    clearBoard(): void {
        this.moves.length = 0;
        this.lastMoveIndex = -1;
        this.chess.clear();
        this.updateBoard();
    }

    placePiece(pieceType: ChessPieceSymbol, square: ChessSquare, color: ChessColor): boolean {
        const successful = this.chess.put({
            type: pieceType,
            color: color[0] as ChessJS.Color
        }, square);
        this.updateBoard();
        return successful;
    }

    getPieceOnSquare(square: ChessSquare): ChessPiece {
        return this.chess.get(square);
    }
}

customElements.define("chess-board", Chessboard);