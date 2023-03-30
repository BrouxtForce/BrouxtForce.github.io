import { Opening } from "./opening.js";
export class OpeningList {
    constructor(node) {
        this.node = node;
        this.openingNodeMap = new Map();
        this.currentOpening = null;
    }
    add(...openingNames) {
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
    remove(openingName) {
        const nodeToRemove = this.openingNodeMap.get(openingName);
        if (nodeToRemove === undefined) {
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
    async select(openingName) {
        const node = this.openingNodeMap.get(openingName);
        if (node === undefined) {
            return;
        }
        this.currentOpening = await Opening.load(openingName);
        this.node.querySelector(".active")?.classList?.remove?.("active");
        let openingButton = this.openingNodeMap.get(openingName);
        if (openingButton === undefined) {
            console.error(`Opening '${openingName}' button does not exist.`);
            return;
        }
        openingButton.classList.add("active");
    }
}
