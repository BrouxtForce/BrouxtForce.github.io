export var Storage;
(function (Storage) {
    function get(key) {
        return localStorage.getItem(key);
    }
    Storage.get = get;
    function set(key, value) {
        localStorage.setItem(key, value);
    }
    Storage.set = set;
    function remove(key) {
        localStorage.removeItem(key);
    }
    Storage.remove = remove;
    function clear() {
        localStorage.clear();
    }
    Storage.clear = clear;
})(Storage || (Storage = {}));
