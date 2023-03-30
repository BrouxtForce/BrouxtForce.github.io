import { addToObjectStore, deleteFromObjectStore, getFromObjectStore } from "../../utils/indexeddb-helpers.js";
export class ReconDB {
    constructor(db) {
        this.db = db;
        this.db.onerror = (event) => {
            let request = event.target;
            console.error(request.error);
        };
    }
    static async load() {
        return new Promise((resolve, reject) => {
            let openRequest = indexedDB.open("reconstructions", ReconDB.version);
            openRequest.onupgradeneeded = () => {
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
            };
        });
    }
    async addRecon(recon) {
        return new Promise((resolve, reject) => {
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
    async editRecon(name, recon) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction("data", "readwrite");
            let data = transaction.objectStore("data");
            let request = data.put(recon);
            request.onerror = () => {
                reject(new Error(`Failed to edit reconstruction '${name}'.`));
            };
            request.onsuccess = () => {
                resolve();
            };
            transaction.commit();
        });
    }
    async getRecon(name) {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction("data", "readonly");
            let data = transaction.objectStore("data");
            let request = data.get(name);
            request.onerror = () => {
                reject(new Error(`Failed to get reconstruction ${name}.`));
            };
            request.onsuccess = () => {
                console.log(request);
                resolve(request.result);
            };
            transaction.commit();
        });
    }
    ;
    async getReconNames() {
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction("data", "readonly");
            let data = transaction.objectStore("data");
            let request = data.getAllKeys();
            request.onerror = () => {
                reject(new Error("Failed to get reconstruction names."));
            };
            request.onsuccess = () => {
                resolve(request.result);
            };
            transaction.commit();
        });
    }
    async deleteRecon(name) {
        return new Promise((resolve, reject) => {
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
    async deleteAllRecons() {
        return new Promise((resolve, reject) => {
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
ReconDB.version = 1;
;
export class SessionDB {
    constructor(name, db) {
        this.solveCount = 0;
        this.name = name;
        this.dbName = SessionDB.dbPrefix + this.name;
        this.db = db;
    }
    static async load(name) {
        return new Promise((resolve, reject) => {
            let openRequest = indexedDB.open(SessionDB.dbPrefix + name, SessionDB.version);
            openRequest.onupgradeneeded = () => {
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
    async addSolve(solve) {
        this.solveCount++;
        addToObjectStore(this.db, "solves", solve);
    }
    async getSolve(index) {
        return getFromObjectStore(this.db, "solves", index);
    }
    async deleteSolve(index) {
        this.solveCount--;
        deleteFromObjectStore(this.db, "solves", index);
    }
    async getKeys() {
        return new Promise((resolve, reject) => {
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
    async lastSolveIndex() {
        return new Promise((resolve, reject) => {
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
                resolve(request.result.key);
            };
            transaction.commit();
        });
    }
    async getSolveCount() {
        return new Promise((resolve, reject) => {
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
    async getAllSolves() {
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
}
SessionDB.version = 1;
SessionDB.dbPrefix = "session_";
