import { OpeningDB } from "./opening-db.js";
import { Chess } from "../dependencies/chessjs/chess.js";
export class Opening {
    constructor(name, openingDB, positionMap) {
        this.name = name;
        this.positionMap = positionMap;
        this.openingDB = openingDB;
    }
    static async load(name) {
        const openingDB = await OpeningDB.load(name);
        const opening = new Opening(name, openingDB, await openingDB.loadIntoMap());
        return opening;
    }
    static async names() {
        let dbNames = await OpeningDB.dbNames();
        let dbPrefix = OpeningDB.dbPrefix;
        let prefixedOpeningNames = dbNames.filter(value => {
            return value.slice(0, dbPrefix.length) == dbPrefix;
        });
        return prefixedOpeningNames.map(value => value.slice(dbPrefix.length));
    }
    async save() {
        await this.openingDB.overwriteWithMap(this.positionMap);
    }
    openingFen(fen) {
        return fen.split(" ").slice(0, -2).join(" ");
    }
    writeObjectWithPosition(object, chess) {
        const fen = this.openingFen(chess.fen());
        for (const move in object) {
            const newPosition = new Chess(chess.fen());
            newPosition.move(move);
            let positionData = this.positionMap.get(fen) ?? { moves: [] };
            let moves = positionData.moves;
            if (moves.indexOf(move) === -1) {
                moves.push(move);
            }
            this.positionMap.set(fen, positionData);
            this.writeObjectWithPosition(object[move], newPosition);
        }
    }
    writeObject(object) {
        const startingPosition = new Chess();
        this.writeObjectWithPosition(object, startingPosition);
    }
    async delete() {
        await this.openingDB.delete();
    }
    getMoves(fen) {
        return this.positionMap.get(this.openingFen(fen))?.moves ?? [];
    }
    getComments(fen) {
        return this.positionMap.get(this.openingFen(fen))?.comments ?? [];
    }
    writePgnParserMovesWithPosition(moveObjects, chess) {
        const currentPosition = new Chess(chess.fen());
        for (const moveObject of moveObjects) {
            const fen = this.openingFen(currentPosition.fen());
            if (moveObject.ravs) {
                for (const rav of moveObject.ravs) {
                    this.writePgnParserMovesWithPosition(rav.moves, currentPosition);
                }
            }
            const move = moveObject.move;
            currentPosition.move(moveObject.move);
            const positionData = this.positionMap.get(fen) ?? { moves: [] };
            const moves = positionData.moves;
            if (moves.indexOf(move) === -1) {
                moves.push(move);
            }
            const nextFen = this.openingFen(currentPosition.fen());
            const nextPositionData = this.positionMap.get(nextFen) ?? { moves: [] };
            const comments = nextPositionData.comments ?? [];
            const newComments = moveObject.comments.map(value => value.text.trim());
            const allComments = Array.from(new Set(comments.concat(newComments)));
            if (allComments.length > 0) {
                nextPositionData.comments = allComments;
            }
            this.positionMap.set(fen, positionData);
            if (newComments.length > 0) {
                this.positionMap.set(nextFen, nextPositionData);
            }
        }
    }
    writePgnParserObject(object) {
        const startingPosition = new Chess();
        this.writePgnParserMovesWithPosition(object.moves, startingPosition);
        console.log(this.positionMap);
    }
}
