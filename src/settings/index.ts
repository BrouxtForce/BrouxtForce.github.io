import { Settings } from "./settings.js";
import { TableOfContents } from "./table-of-contents.js";

const tocContainer = document.querySelector(".toc-container") as HTMLElement;
const tableOfContents = new TableOfContents(tocContainer);

const settingsContainer = document.querySelector(".settings-container") as HTMLElement;
const settings = new Settings(settingsContainer);

const settingsArguments = await (await fetch("/assets/settings/settings.json")).json();

for (const args of settingsArguments) {
    // @ts-ignore
    const settingGroupContainer = settings.add(...args);
    tableOfContents.addDirectory(args[0], settingGroupContainer);
}
