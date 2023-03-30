import { addToObjectStore, deleteFromObjectStore, getFromObjectStore } from "../utils/indexeddb-helpers.js";

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
    async loadIntoMap(): Promise<Map<string, string[]>> {
        return new Promise((resolve, reject) => {
            const map = new Map<string, string[]>();

            let transaction = this.db.transaction("positions", "readonly");
            let positions = transaction.objectStore("positions");

            let request = positions.openCursor();

            request.onerror = () => {
                reject();
            };

            request.onsuccess = (event) => {
                let cursor = (event?.target as any)?.result as IDBCursorWithValue | null;
                if (cursor) {
                    map.set(cursor.value.fen as string, cursor.value.moves);
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
    async overwriteWithMap(map: Map<string, string[]>): Promise<void> {
        let transaction = this.db.transaction("positions", "readwrite");
        let positions = transaction.objectStore("positions");

        for (const [key, value] of map) {
            await (
                new Promise<void>((resolve, reject) => {
                    let getRequest = positions.get(key);

                    getRequest.onerror = () => {
                        reject();
                    };

                    getRequest.onsuccess = () => {
                        if (getRequest.result === undefined) {
                            let addRequest = positions.add({
                                fen: key,
                                moves: value
                            });

                            addRequest.onsuccess = () => {
                                resolve();
                            };

                            return;
                        }

                        let moves = getRequest.result.moves as string[];

                        let putRequest = positions.put({
                            fen: key,
                            moves: Array.from(new Set(moves.concat(value)))
                        });

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