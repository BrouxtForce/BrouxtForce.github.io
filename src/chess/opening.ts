import { OpeningDB } from "./opening-db.js";
import { Chess } from "../dependencies/chessjs/chess.js";
import { OpeningPosition } from "./opening-db.js";

export class Opening {
    public readonly name: string;

    private positionMap: Map<string, OpeningPosition>;
    private openingDB: OpeningDB;

    private constructor(name: string, openingDB: OpeningDB, positionMap: Map<string, OpeningPosition>) {
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
            let positionData = this.positionMap.get(fen) ?? { moves: [] };
            let moves = positionData.moves;
            if (moves.indexOf(move) === -1) {
                moves.push(move);
            }
            this.positionMap.set(fen, positionData);

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
        return this.positionMap.get(this.openingFen(fen))?.moves ?? [];
    }
    getComments(fen: string): string[] {
        return this.positionMap.get(this.openingFen(fen))?.comments ?? [];
    }

    private writePgnParserMovesWithPosition(moveObjects: PgnParserMove[], chess: Chess): void {
        const currentPosition = new Chess(chess.fen());
        
        for (const moveObject of moveObjects) {
            const fen = this.openingFen(currentPosition.fen());
            
            // Continue down all variations
            if (moveObject.ravs) {
                for (const rav of moveObject.ravs) {
                    this.writePgnParserMovesWithPosition(rav.moves, currentPosition);
                }
            }
            
            // Make the move
            const move = moveObject.move;
            currentPosition.move(moveObject.move);

            // Record the move
            const positionData = this.positionMap.get(fen) ?? { moves: [] };

            const moves = positionData.moves;
            // TODO: Move decorations (such as Bxh7+!! or Ke2??) are not accounted for (e.g. both h3? and h3 would both be in the move array)
            if (moves.indexOf(move) === -1) {
                moves.push(move);
            }

            // Record the comment
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
    writePgnParserObject(object: PgnParserOutput): void {
        const startingPosition = new Chess();

        this.writePgnParserMovesWithPosition(object.moves, startingPosition);

        console.log(this.positionMap);
    }
}