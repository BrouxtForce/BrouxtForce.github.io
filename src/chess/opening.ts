import { OpeningDB } from "./opening-db.js";
import { Chess } from "../dependencies/chessjs/chess.js";

export class Opening {
    public readonly name: string;

    private positionMap: Map<string, string[]>;
    private openingDB: OpeningDB;

    private constructor(name: string, openingDB: OpeningDB, positionMap: Map<string, string[]>) {
        this.name = name;

        this.positionMap = positionMap;
        this.openingDB = openingDB;
    }
    static async load(name: string): Promise<Opening> {
        const openingDB = await OpeningDB.load(name);
        const opening = new Opening(name, openingDB, await openingDB.loadIntoMap());

        return opening;
    }
    static async names(): Promise<string[]> {
        let dbNames = await OpeningDB.dbNames();

        let dbPrefix = OpeningDB.dbPrefix;
        let prefixedOpeningNames = dbNames.filter(value => {
            return value.slice(0, dbPrefix.length) == dbPrefix
        });

        return prefixedOpeningNames.map(value => value.slice(dbPrefix.length));
    }

    async save(): Promise<void> {
        await this.openingDB.overwriteWithMap(this.positionMap);
    }

    // Omits the last two FEN fields for the 50 move rule and how many turns were played
    // For obvious reasons, these fields are unnecessary for openings,
    //  and omitting allows transpositions to be stored more efficiently and reduces
    //  the size of the fen string being stored
    private openingFen(fen: string): string {
        return fen.split(" ").slice(0, -2).join(" ");
    }
    private writeObjectWithPosition(object: any, chess: Chess): void {
        const fen = this.openingFen(chess.fen());
        for (const move in object) {
            // Make the move
            const newPosition = new Chess(chess.fen());
            newPosition.move(move);
            
            // Record the move
            let position = this.positionMap.get(fen) ?? [];
            if (position.indexOf(move) === -1) {
                position.push(move);
            }
            this.positionMap.set(fen, position);

            // Continue recursively
            this.writeObjectWithPosition(object[move], newPosition);
        }
    }
    writeObject(object: any): void {
        const startingPosition = new Chess();

        this.writeObjectWithPosition(object, startingPosition);
    }
    async delete(): Promise<void> {
        await this.openingDB.delete();
    }

    getMoves(fen: string): string[] {
        return this.positionMap.get(this.openingFen(fen)) ?? [];
    }
}