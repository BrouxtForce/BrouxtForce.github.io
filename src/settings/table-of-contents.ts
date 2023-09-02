export class TableOfContents {
    private _container: HTMLElement;

    private _settingsContainerNodeMap: Map<string, HTMLElement>;
    private _listNodeMap: Map<string, HTMLElement>;

    constructor(container: HTMLElement) {
        this._container = container;

        this._settingsContainerNodeMap = new Map();
        this._listNodeMap = new Map();
    }

    addDirectory(names: string[], settingsContainerNode: HTMLElement): void {
        this._settingsContainerNodeMap.set(names.join("/"), settingsContainerNode);

        let currentNode: HTMLElement = this._container;
        let currentPath: string = "";
        for (const name of names) {
            currentPath += name;

            let node = this._listNodeMap.get(currentPath);
            if (node === undefined) {
                node = document.createElement("div");
                node.className = "toc-list-item";

                const tocListTitle = document.createElement("div");
                tocListTitle.textContent = name;
                tocListTitle.className = "toc-list-title";
                node.append(tocListTitle);

                // tocListTitle.addEventListener("click", () => {
                //     tocListTitle.classList.toggle("collapsed");
                // });

                this._listNodeMap.set(currentPath, node);
                currentNode.append(node);
            }
            currentNode = node;

            currentPath += "/";
        }

        currentNode.addEventListener("click", () => {
            for (const container of this._settingsContainerNodeMap.values()) {
                container.hidden = true;
                container.classList.remove("selected");
            }
            settingsContainerNode.hidden = false;
            settingsContainerNode.classList.add("selected");
        });
    }
}