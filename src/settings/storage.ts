export namespace Storage {
    export function get(key: string): string | null {
        return localStorage.getItem(key);
    }
    export function set(key: string, value: string): void {
        localStorage.setItem(key, value);
    }
    export function remove(key: string): void {
        localStorage.removeItem(key);
    }
    export function clear(): void {
        localStorage.clear();
    }
}