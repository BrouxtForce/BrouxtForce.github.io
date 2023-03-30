import { Chessboard } from "./chessboard.js"

export class MoveTable extends HTMLElement {
    private node: HTMLElement;
    private highlightedMoveNode: HTMLElement | null;
    private moves: string[];
    private moveNodes: HTMLElement[];

    constructor() {
        super();

        this.node = document.createElement("div");
        this.node.classList.add("move-table");

        this.highlightedMoveNode = null;
        this.moves = [];
        this.moveNodes = [];
    }
    connectedCallback() {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/chess/move-table.css";
        this.appendChild(link);

        this.appendChild(this.node);
    }
    attachToChessboard(chessboard: Chessboard): void {
        chessboard.addEventListener("boardupdate", () => {
            this.update(chessboard.moves, chessboard.lastMoveIndex);
        });
    }

    addMove(move: string) {
        this.moves.push(move);

        const node = document.createElement("div");
        node.textContent = move;
        node.className = "move-san";
        this.moveNodes.push(node);
        this.node.appendChild(node);
    }
    updateMove(move: string, index: number) {
        if (index > this.moves.length) {
            console.error("Cannot call UpdateMove() when index is greater than MoveTable.moves.length.");
            return;
        }
        if (index === this.moves.length) {
            this.addMove(move);
            return;
        }
        this.moves[index] = move;
        this.moveNodes[index].textContent = move;
    }

    update(moves: string[], currentMoveIndex: number) {
        // Remove highlighting (if applicable)
        if (this.highlightedMoveNode) {
            this.highlightedMoveNode.classList.remove("current-move");
            this.highlightedMoveNode = null;
        }

        // Update html
        while (this.moves.length > moves.length) {
            this.moves.pop();
            this.moveNodes.pop()?.remove?.();
        }
        for (let i = 0; i < moves.length; i++) {
            this.updateMove(moves[i], i);
        }

        // Add highlighted-move class to appropriate node
        this.highlightedMoveNode = this.moveNodes[currentMoveIndex];
        if (this.highlightedMoveNode) {
            this.highlightedMoveNode.classList.add("current-move");
        }
    }
}

customElements.define("move-table", MoveTable);