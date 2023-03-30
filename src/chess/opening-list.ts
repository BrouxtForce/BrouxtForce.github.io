import { Opening } from "./opening.js";

export class OpeningList {
    private node: HTMLDivElement;
    private openingNodeMap: Map<string, HTMLButtonElement>;

    public currentOpening: Opening | null;

    constructor(node: HTMLDivElement) {
        this.node = node;
        this.openingNodeMap = new Map();
        this.currentOpening = null;
    }
    add(...openingNames: string[]): void {
        for (const name of openingNames) {
            const button = document.createElement("button");
            button.addEventListener("click", async () => {
                await this.select(name);
            });
            button.textContent = name;
            this.node.appendChild(button);
            this.openingNodeMap.set(name, button);
        }
    }
    remove(openingName: string): void {
        const nodeToRemove = this.openingNodeMap.get(openingName);
        if (nodeToRemove === undefined) {
            // This error should never occur
            console.error(`Cannot remove '${openingName}' because it does not exist.`);
            return;
        }

        const activeOpening = this.node.querySelector(".active");
        if (nodeToRemove === activeOpening) {
            this.currentOpening = null;
        }

        nodeToRemove.remove();
        this.openingNodeMap.delete(openingName);
    }
    async select(openingName: string): Promise<void> {
        const node = this.openingNodeMap.get(openingName);

        if (node === undefined) {
            return;
        }

        this.currentOpening = await Opening.load(openingName);

        // Remove active opening class from the active opening
        this.node.querySelector(".active")?.classList?.remove?.("active");

        // Make the current opening button active
        let openingButton = this.openingNodeMap.get(openingName);
        if (openingButton === undefined) {
            // This error should never happen
            console.error(`Opening '${openingName}' button does not exist.`);
            return;
        }
        openingButton.classList.add("active");
    }
}