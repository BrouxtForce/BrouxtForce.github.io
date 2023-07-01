import { addToObjectStore, deleteFromObjectStore, getFromObjectStore } from "../utils/indexeddb-helpers.js";

export interface OpeningPosition {
    moves: string[];
    comments?: string[];
}
interface OpeningPositionWithFen extends OpeningPosition {
    fen: string;
}

export class OpeningDB {
    public static readonly version = 1;
    public static readonly dbPrefix = "chess_opening_";

    private db: IDBDatabase;
    private name: string;

    private constructor(db: IDBDatabase, name: string) {
        this.db = db;
        this.name = name;
    }
    static async load(name: string): Promise<OpeningDB> {
        return new Promise((resolve, reject) => {
            let openRequest = indexedDB.open(OpeningDB.dbPrefix + name, OpeningDB.version);

            openRequest.onupgradeneeded = () => {
                // Triggers if the database does not exist
                let db = openRequest.result;
                db.createObjectStore("positions", {
                    keyPath: "fen"
                });
            };
            openRequest.onerror = () => {
                console.error(`IndexedDB Error: ${openRequest.error}`);
                reject(new Error("Failed to initialize OpeningDB()."));
            };
            openRequest.onsuccess = () => {
                resolve(new OpeningDB(openRequest.result, name));
            };
        });
    }

    async addMove(san: string, fen: string): Promise<void> {
        let entry = await getFromObjectStore(this.db, "positions", fen);

        if (entry !== undefined) {
            entry.moves.push(san);
        } else {
            entry = {
                fen: fen,
                moves: [san]
            };
        }

        await addToObjectStore(this.db, "positions", entry);
    }
    async getMovesAtFen(fen: string): Promise<string[] | null> {
        let entry = await getFromObjectStore(this.db, "positions", fen);

        if (entry === undefined) {
            return null;
        }
        return entry.moves;
    }
    async loadIntoMap(): Promise<Map<string, OpeningPosition>> {
        return new Promise((resolve, reject) => {
            const map = new Map<string, OpeningPosition>();

            let transaction = this.db.transaction("positions", "readonly");
            let positions = transaction.objectStore("positions");

            let request = positions.openCursor();

            request.onerror = () => {
                reject();
            };

            request.onsuccess = (event) => {
                let cursor = (event?.target as any)?.result as IDBCursorWithValue | null;
                if (cursor) {
                    const openingPositionWithFen: OpeningPositionWithFen = cursor.value;

                    const openingPosition: OpeningPosition = {
                        moves: openingPositionWithFen.moves
                    };
                    if (openingPositionWithFen.comments !== undefined) {
                        openingPosition.comments = openingPositionWithFen.comments;
                    }

                    map.set(openingPositionWithFen.fen, openingPosition);
                    cursor.continue();
                } else {
                    transaction.commit();
                }
            };

            transaction.oncomplete = () => {
                resolve(map);
            };
        });
    }
    async overwriteWithMap(map: Map<string, OpeningPosition>): Promise<void> {
        let transaction = this.db.transaction("positions", "readwrite");
        let positions = transaction.objectStore("positions");

        for (const [fen, openingPosition] of map) {
            await (
                new Promise<void>((resolve, reject) => {
                    let getRequest = positions.get(fen);

                    getRequest.onerror = () => {
                        reject();
                    };

                    getRequest.onsuccess = () => {
                        if (getRequest.result === undefined) {
                            let openingPositionWithFen: OpeningPositionWithFen = {
                                fen: fen,
                                moves: openingPosition.moves
                            };
                            if (openingPosition.comments !== undefined) {
                                openingPositionWithFen.comments = openingPosition.comments;
                            }

                            let addRequest = positions.add(openingPositionWithFen);

                            addRequest.onsuccess = () => {
                                resolve();
                            };

                            return;
                        }

                        let moves: string[] = getRequest.result.moves;
                        let updatedMoves: string[] = Array.from(new Set(moves.concat(openingPosition.moves)));

                        let comments: string[] | undefined = getRequest.result.comments;
                        let updatedComments: string[] = (comments !== undefined) ?
                            Array.from(new Set(comments.concat(openingPosition.comments ?? []))) :
                            openingPosition.comments ?? [];
                        
                        let updatedOpeningPosition: OpeningPositionWithFen = {
                            fen: fen,
                            moves: updatedMoves
                        };
                        if (updatedComments.length > 0) {
                            updatedOpeningPosition.comments = updatedComments;
                        }
                        
                        let putRequest = positions.put(updatedOpeningPosition);

                        putRequest.onsuccess = () => {
                            resolve();
                        };
                    };
                })
            );
        }

        transaction.commit();
    }

    static async dbNames(): Promise<string[]> {
        const databases = await indexedDB.databases();
        return databases.map(value => value.name as string);
    }

    async delete(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.close();
            let request = indexedDB.deleteDatabase(OpeningDB.dbPrefix + this.name);

            request.onerror = () => {
                alert("Error: Database could not be deleted.");
                reject(new Error("Failed to delete IndexedDB Database."));
            };
            request.onsuccess = () => {
                alert("Database successfully deleted.");
                resolve();
            };
        })
    }
}