export async function addToObjectStore(db, objectStoreName, data) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(objectStoreName, "readwrite");
        let objectStore = transaction.objectStore(objectStoreName);
        let request = objectStore.add(data);
        request.onerror = () => {
            reject(new Error(`Failed to add data to '${objectStoreName}'.`));
        };
        request.onsuccess = () => {
            resolve();
        };
        transaction.commit();
    });
}
export async function deleteFromObjectStore(db, objectStoreName, key) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(objectStoreName, "readwrite");
        let objectStore = transaction.objectStore(objectStoreName);
        let request = objectStore.delete(key);
        request.onerror = () => {
            reject(new Error(`Failed to delete data from '${objectStoreName}'.`));
        };
        request.onsuccess = () => {
            resolve();
        };
        transaction.commit();
    });
}
export async function getFromObjectStore(db, objectStoreName, key) {
    return new Promise((resolve, reject) => {
        let transaction = db.transaction(objectStoreName, "readonly");
        let objectStore = transaction.objectStore(objectStoreName);
        let request = objectStore.get(key);
        request.onerror = () => {
            reject(new Error(`Failed to delete data from '${objectStoreName}'.`));
        };
        request.onsuccess = () => {
            resolve(request.result);
        };
        transaction.commit();
    });
}
