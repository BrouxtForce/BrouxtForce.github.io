import { Chessboard } from "./chess-templates.js";
import { OpeningList } from "./opening-list.js";

export class OpeningPlayer {
    private chessboard: Chessboard;
    private openingList: OpeningList;

    private usermoveCallback: (event?: Event) => void;

    public active: boolean;

    constructor(chessboard: Chessboard, openingList: OpeningList) {
        this.chessboard = chessboard;
        this.openingList = openingList;

        this.usermoveCallback = () => {
            if (this.chessboard.turn() !== this.chessboard.getUserColor()) {
                this.move();
            }
        };

        this.active = false;
    }

    move(): void {
        const opening = this.openingList.currentOpening;
        if (opening === null) {
            return;
        }

        // Check if the user's move was accurate
        if (this.chessboard.undo()) {
            let possibleMoves = opening.getMoves(this.chessboard.fen());
            this.chessboard.redo();

            let lastMove = this.chessboard.moves[this.chessboard.lastMoveIndex];

            if (possibleMoves.indexOf(lastMove) === -1) {
                this.chessboard.undo();
                alert(`Incorrect move: ${lastMove}`);
                return;
            }
        }

        // Select a move
        let possibleMoves = opening.getMoves(this.chessboard.fen());
        if (possibleMoves.length === 0) {
            alert("End of line");
            return;
        }

        let randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        
        // Make the move (after some time)
        window.setTimeout(() => {
            this.chessboard.move(randomMove);
            this.chessboard.updateBoard();
        }, 100);
    }

    // Returns true if activation was successful
    activate(): boolean {
        if (this.active) {
            console.error("Cannot activate OpeningPlayer() when already active.");
            return false;
        }

        let color: string | null = prompt("Train with what color?");
        while (color !== "white" && color !== "black") {
            if (color === null) {
                return false;
            }
            color = prompt("Invalid color. Train with what color?");
        }

        this.active = true;
        this.chessboard.setUserColor(color);
        this.chessboard.addEventListener("usermove", this.usermoveCallback);
        this.usermoveCallback();

        return true;
    }
    deactivate(): void {
        if (!this.active) {
            console.error("Cannot deactivate OpeningPlayer() when not active.");
        }

        this.active = false;
        this.chessboard.setUserColor("");
        this.chessboard.removeEventListener("usermove", this.usermoveCallback);
    }
}