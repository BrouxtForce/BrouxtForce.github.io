/*
    TODO: Make things work between different tabs (likely with BroadcastChannel API)
    (SharedWorkers would be great but browser support is not there yet)

    Ref: https://javascript.info/indexeddb
*/

import { addToObjectStore, deleteFromObjectStore, getFromObjectStore } from "../../utils/indexeddb-helpers.js";

// DBs
export interface Recon {
    name: string,
    scramble: string;
    solution: string;
    puzzleSize: number;
}
export class ReconDB {
    private static version = 1;

    private db: IDBDatabase;

    private constructor(db: IDBDatabase) {
        this.db = db;

        this.db.onerror = (event) => {
            let request = event.target as IDBRequest;
            console.error(request.error);
        }
    }
    static async load(): Promise<ReconDB> {
        return new Promise<ReconDB>((resolve, reject) => {
            let openRequest = indexedDB.open("reconstructions", ReconDB.version);

            openRequest.onupgradeneeded = () => {
                // Triggers if the database does not exist
                let db = openRequest.result;
                db.createObjectStore("data", {
                    keyPath: "name"
                });
            };
            openRequest.onerror = () => {
                console.error(`IndexedDB Error: ${openRequest.error}`);
                reject(new Error("Failed to initialize ReconDB()."));
            };
            openRequest.onsuccess = () => {
                resolve(new ReconDB(openRequest.result));
            }
        });

    }

    async addRecon(recon: Recon): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let transaction = this.db.transaction("data", "readwrite");
            let data = transaction.objectStore("data");

            let request = data.add(recon);

            request.onerror = () => {
                reject(new Error(`Failed to add reconstruction '${recon.name}'.`));
            };

            request.onsuccess = () => {
                resolve();
            };
            
            transaction.commit();
        });
    }
    async editRecon(name: string, recon: Recon): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let transaction = this.db.transaction("data", "readwrite");
            let data = transaction.objectStore("data");

            let request = data.put(recon);

            request.onerror = () => {
                reject(new Error(`Failed to edit reconstruction '${name}'.`));
            }

            request.onsuccess = () => {
                resolve();
            }

            transaction.commit();
        });
    }
    async getRecon(name: string): Promise<Recon> {
        return new Promise<Recon>((resolve, reject) => {
            let transaction = this.db.transaction("data", "readonly");
            let data = transaction.objectStore("data");

            let request = data.get(name);

            request.onerror = () => {
                reject(new Error(`Failed to get reconstruction ${name}.`));
            }

            request.onsuccess = () => {
                console.log(request);
                resolve(request.result);
            };

            transaction.commit();
        });
    };
    async getReconNames(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            let transaction = this.db.transaction("data", "readonly");
            let data = transaction.objectStore("data");

            let request = data.getAllKeys();

            request.onerror = () => {
                reject(new Error("Failed to get reconstruction names."));
            };

            request.onsuccess = () => {
                resolve(request.result as string[]);
            }

            transaction.commit();
        });
    }
    async deleteRecon(name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let transaction = this.db.transaction("data", "readwrite");
            let data = transaction.objectStore("data");

            let request = data.delete(name);

            request.onerror = () => {
                reject(new Error(`Failed to delete reconstruction '${name}'.`));
            };

            request.onsuccess = () => {
                resolve();
            };

            transaction.commit();
        });
    }
    async deleteAllRecons(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let transaction = this.db.transaction("data", "readwrite");
            let data = transaction.objectStore("data");

            let request = data.clear();

            request.onerror = () => {
                reject("Failed to delete all reconstructions.");
            };

            request.onsuccess = () => {
                resolve();
            };

            transaction.commit();
        });
    }
}

export interface Solve {
    time: number,
    scramble: string,
    id?: number
};
export class SessionDB {
    private static version = 1;
    private static dbPrefix = "session_";

    private name: string;
    private dbName: string;

    private db: IDBDatabase;

    public solveCount: number = 0;

    private constructor(name: string, db: IDBDatabase) {
        this.name = name;
        this.dbName = SessionDB.dbPrefix + this.name;
        this.db = db;
    }
    static async load(name: string): Promise<SessionDB> {
        return new Promise<SessionDB>((resolve, reject) => {
            let openRequest = indexedDB.open(SessionDB.dbPrefix + name, SessionDB.version);

            openRequest.onupgradeneeded = () => {
                // Triggers if the database does not exist
                let db = openRequest.result;
                db.createObjectStore("solves", {
                    autoIncrement: true
                });
            };
            openRequest.onerror = () => {
                console.error(`IndexedDB Error: ${openRequest.error}`);
                reject(new Error("Failed to initialize ReconDB()."));
            };
            openRequest.onsuccess = async () => {
                const session = new SessionDB(name, openRequest.result);
                session.solveCount = await session.getSolveCount();
                resolve(session);
            };
        });
    }

    async addSolve(solve: Solve): Promise<void> {
        this.solveCount++;
        addToObjectStore(this.db, "solves", solve);
    }
    async getSolve(index: number): Promise<Solve> {
        return getFromObjectStore(this.db, "solves", index) as Promise<Solve>;
    }
    async deleteSolve(index: number): Promise<void> {
        // return new Promise<void>((resolve, reject) => {
        //     let transaction = this.db.transaction("solves", "readwrite");
        //     let objectStore = transaction.objectStore("solves");
    
        //     // Requests
        //     let deleteRequest = objectStore.delete(index);
        //     let cursorRequest = objectStore.openCursor(index + 1, "next");

        //     cursorRequest.onsuccess = () => {

        //         // Called once for each solve after the deleted solve
        //         // cursorRequest.onsuccess = () => {
        //             let cursor = cursorRequest.result;
        //             if (cursor === null) {
        //                 reject();
        //                 return;
        //             }

        //             let putRequest = objectStore.put(cursor.value, (cursor.key as number) - 1);
        //         // }

        //     };

        //     // Events
        //     transaction.oncomplete = () => {
        //         resolve();
        //     }
        // });
        this.solveCount--;
        deleteFromObjectStore(this.db, "solves", index);
    }
    async getKeys(): Promise<IDBValidKey[]> {
        return new Promise<IDBValidKey[]>((resolve, reject) => {
            let transaction = this.db.transaction("solves", "readonly");
            let solves = transaction.objectStore("solves");

            let request = solves.getAllKeys();

            request.onerror = () => {
                reject(new Error("Failed to get all keys."));
            };
            request.onsuccess = () => {
                resolve(request.result);
            };

            transaction.commit();
        });
    }
    async lastSolveIndex(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            let transaction = this.db.transaction("solves", "readonly");
            let solves = transaction.objectStore("solves");

            let request = solves.openCursor(null, "prev");

            request.onerror = () => {
                reject(new Error("Failed to get last key."));
            };
            request.onsuccess = () => {
                if (request.result === null) {
                    resolve(-1);
                    return;
                }
                resolve(request.result.key as number);
            };

            transaction.commit();
        });
    }
    async getSolveCount(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            let transaction = this.db.transaction("solves", "readonly");
            let solves = transaction.objectStore("solves");

            let request = solves.count();

            request.onerror = () => {
                reject(new Error("Failed to get count of solves."));
            };
            request.onsuccess = () => {
                resolve(request.result);
            };

            transaction.commit();
        });
    }
    async getAllSolves(): Promise<Solve[]> {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction("solves", "readonly");
            let solves = transaction.objectStore("solves");

            let request = solves.getAll();

            request.onerror = () => {
                reject(new Error("Failed to get all solves."));
            };
            request.onsuccess = () => {
                resolve(request.result);
            };

            transaction.commit();
        });
    }

    // addTime(time: number, scramble: Alg, penalties: TimePenalty[]): number {

    // }
    // deleteSolve(index: number): void {

    // }
    // numSolves(): number {

    // }
}