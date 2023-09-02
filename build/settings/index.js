import { Settings } from "./settings.js";
import { TableOfContents } from "./table-of-contents.js";
const tocContainer = document.querySelector(".toc-container");
const tableOfContents = new TableOfContents(tocContainer);
const settingsContainer = document.querySelector(".settings-container");
const settings = new Settings(settingsContainer);
const settingsArguments = await (await fetch("/assets/settings/settings.json")).json();
for (const args of settingsArguments) {
    const settingGroupContainer = settings.add(...args);
    tableOfContents.addDirectory(args[0], settingGroupContainer);
}
