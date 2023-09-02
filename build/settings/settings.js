import { Storage } from "./storage.js";
export class Settings {
    constructor(container) {
        this._container = container;
        this._directoryMap = new Map();
        this._defaultMap = new Map();
    }
    add(directory, ...settingDescriptors) {
        for (const descriptor of settingDescriptors) {
            this._defaultMap.set(descriptor.name, descriptor.default);
        }
        return this.addDirectoryHtml(directory, ...settingDescriptors);
    }
    get(name) {
        return Storage.get(name) ?? this._defaultMap.get(name) ?? null;
    }
    set(name, value) {
        Storage.set(name, value);
    }
    createSettingNode(settingDescriptor) {
        const containerNode = document.createElement("div");
        containerNode.className = "setting-container";
        const settingNameNode = document.createElement("div");
        settingNameNode.className = "setting-name";
        settingNameNode.textContent = settingDescriptor.name;
        const settingDescriptionNode = document.createElement("div");
        settingDescriptionNode.className = "setting-description";
        settingDescriptionNode.textContent = settingDescriptor.description;
        let inputNode;
        switch (settingDescriptor.type) {
            case "boolean":
                inputNode = document.createElement("select");
                const trueOption = document.createElement("option");
                trueOption.value = "true";
                trueOption.textContent = "True";
                const falseOption = document.createElement("option");
                falseOption.value = "false";
                falseOption.textContent = "False";
                inputNode.append(trueOption, falseOption);
                break;
            case "number":
                inputNode = document.createElement("input");
                inputNode.pattern = "([0-9]+\\.?[0-9]*)|([0-9]*\\.[0-9]+)";
                inputNode.required = true;
                break;
            case "string":
                inputNode = document.createElement("input");
                break;
            case "select":
                inputNode = document.createElement("select");
                if (settingDescriptor.options === undefined) {
                    console.error("No options passed into SettingDescriptor.");
                    break;
                }
                for (const option of settingDescriptor.options) {
                    const optionNode = document.createElement("option");
                    optionNode.textContent = option;
                    inputNode.append(optionNode);
                }
                break;
            default:
                inputNode = document.createElement("input");
                console.error(`Invalid type: '${settingDescriptor.type}'`);
                break;
        }
        inputNode.value = settingDescriptor.default;
        inputNode.className = "setting-input";
        inputNode.addEventListener("change", () => {
            if (inputNode.checkValidity()) {
                this.set(settingDescriptor.name, inputNode.value);
            }
        });
        containerNode.append(settingNameNode, settingDescriptionNode, inputNode);
        return containerNode;
    }
    addDirectoryHtml(directory, ...settingDescriptors) {
        let currentNode = this._container;
        let key = "";
        for (let i = 0; i < directory.length; i++) {
            key += directory[i];
            let node = this._directoryMap.get(key);
            if (node === undefined) {
                node = document.createElement("div");
                this._directoryMap.set(key, node);
                currentNode.appendChild(node);
            }
            currentNode = node;
            key += "/";
        }
        const settingNodes = [];
        for (const descriptor of settingDescriptors) {
            settingNodes.push(this.createSettingNode(descriptor));
        }
        currentNode.append(...settingNodes);
        return currentNode;
    }
}
