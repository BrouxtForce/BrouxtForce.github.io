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
            let position = this.positionMap.get(fen) ?? [];
            if (position.indexOf(move) === -1) {
                position.push(move);
            }
            this.positionMap.set(fen, position);
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
        return this.positionMap.get(this.openingFen(fen)) ?? [];
    }
}
