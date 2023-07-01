import { OpeningList } from "./opening-list.js";
import { Opening } from "./opening.js";
import { OpeningPlayer } from "./opening-player.js";
window.module = {};
window.exports = {};
await import("../dependencies/pgn-parser/pgn-parser.js");
const pgnParser = module.exports;
const chessboard = document.querySelector("chess-board");
const moveTable = document.querySelector("move-table");
const openingList = new OpeningList(document.querySelector(".opening-list"));
openingList.add(...await Opening.names());
const openingPlayer = new OpeningPlayer(chessboard, openingList);
moveTable.attachToChessboard(chessboard);
document.body.addEventListener("keydown", event => {
    switch (event.key) {
        case "ArrowUp":
            while (chessboard.undo())
                ;
            chessboard.updateBoard();
            break;
        case "ArrowDown":
            while (chessboard.redo())
                ;
            chessboard.updateBoard();
            break;
        case "ArrowLeft":
            chessboard.undo();
            chessboard.updateBoard();
            break;
        case "ArrowRight":
            chessboard.redo();
            chessboard.updateBoard();
            break;
        default:
            return;
    }
    event.preventDefault();
});
const trainButton = document.getElementById("train-button");
trainButton.addEventListener("click", () => {
    if (openingList.currentOpening === null) {
        alert("No opening selected.");
        return;
    }
    if (openingPlayer.active) {
        openingPlayer.deactivate();
        trainButton.classList.remove("active");
        return;
    }
    if (openingPlayer.activate()) {
        trainButton.classList.add("active");
    }
});
const createOpeningButton = document.getElementById("create-opening-button");
createOpeningButton.addEventListener("click", async () => {
    let openingName = prompt("Enter a name for the opening.");
    if (openingName === null) {
        return;
    }
    openingName = openingName.trim();
    if (openingName === "") {
        alert("Invalid opening name.");
        return;
    }
    let openingNames = await Opening.names();
    if (openingNames.indexOf(openingName) !== -1) {
        alert("Opening already exists.");
        return;
    }
    await Opening.load(openingName);
    openingList.add(openingName);
});
const loadPgnButton = document.getElementById("load-pgn-button");
loadPgnButton.addEventListener("click", async () => {
    if (openingList.currentOpening === null) {
        alert("No opening selected.");
        return;
    }
    const pgn = prompt("Paste a PGN.");
    if (pgn === null) {
        return;
    }
    const [result] = pgnParser.parse(pgn);
    openingList.currentOpening.writePgnParserObject(result);
});
const saveButton = document.getElementById("save-button");
saveButton.addEventListener("click", () => {
    if (openingList.currentOpening === null) {
        alert("No opening selected.");
        return;
    }
    openingList.currentOpening.save();
    alert("Opening successfully saved!");
});
const deleteButton = document.getElementById("delete-button");
deleteButton.addEventListener("click", async () => {
    if (openingList.currentOpening === null) {
        alert("No opening selected.");
        return;
    }
    if (!confirm(`Are you sure you want to delete the '${openingList.currentOpening.name}' opening?`)) {
        return;
    }
    let openingName = openingList.currentOpening.name;
    await openingList.currentOpening.delete();
    openingList.remove(openingName);
});
const flipBoardButton = document.getElementById("flip-board-button");
flipBoardButton.addEventListener("click", () => {
    chessboard.flip();
});
window.addEventListener("load", () => {
    chessboard.dispatchEvent(new Event("resize"));
});
chessboard.dispatchEvent(new Event("resize"));
