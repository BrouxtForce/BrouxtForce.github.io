import { addToObjectStore, getFromObjectStore } from "../utils/indexeddb-helpers.js";
export class OpeningDB {
    constructor(db, name) {
        this.db = db;
        this.name = name;
    }
    static async load(name) {
        return new Promise((resolve, reject) => {
            let openRequest = indexedDB.open(OpeningDB.dbPrefix + name, OpeningDB.version);
            openRequest.onupgradeneeded = () => {
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
    async addMove(san, fen) {
        let entry = await getFromObjectStore(this.db, "positions", fen);
        if (entry !== undefined) {
            entry.moves.push(san);
        }
        else {
            entry = {
                fen: fen,
                moves: [san]
            };
        }
        await addToObjectStore(this.db, "positions", entry);
    }
    async getMovesAtFen(fen) {
        let entry = await getFromObjectStore(this.db, "positions", fen);
        if (entry === undefined) {
            return null;
        }
        return entry.moves;
    }
    async loadIntoMap() {
        return new Promise((resolve, reject) => {
            const map = new Map();
            let transaction = this.db.transaction("positions", "readonly");
            let positions = transaction.objectStore("positions");
            let request = positions.openCursor();
            request.onerror = () => {
                reject();
            };
            request.onsuccess = (event) => {
                let cursor = event?.target?.result;
                if (cursor) {
                    map.set(cursor.value.fen, cursor.value.moves);
                    cursor.continue();
                }
                else {
                    transaction.commit();
                }
            };
            transaction.oncomplete = () => {
                resolve(map);
            };
        });
    }
    async overwriteWithMap(map) {
        let transaction = this.db.transaction("positions", "readwrite");
        let positions = transaction.objectStore("positions");
        for (const [key, value] of map) {
            await (new Promise((resolve, reject) => {
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
                    let moves = getRequest.result.moves;
                    let putRequest = positions.put({
                        fen: key,
                        moves: Array.from(new Set(moves.concat(value)))
                    });
                    putRequest.onsuccess = () => {
                        resolve();
                    };
                };
            }));
        }
        transaction.commit();
    }
    static async dbNames() {
        const databases = await indexedDB.databases();
        return databases.map(value => value.name);
    }
    async delete() {
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
        });
    }
}
OpeningDB.version = 1;
OpeningDB.dbPrefix = "chess_opening_";
