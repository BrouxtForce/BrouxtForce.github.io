class TrainerConfig {
    constructor() {
        this.letterSchemeRaw = "AABDBDCCEEFHFHGGIIJLJLKKMMNPNPOOQQRTRTSSUUVXVXWW";
        this.toLetterSchemeRaw = [
            0,  1,  2,  4,  7,  6,  5,  3,
            8,  9,  10, 12, 15, 14, 13, 11,
            16, 17, 18, 20, 23, 22, 21, 19,
            24, 25, 26, 28, 31, 30, 29, 27,
            32, 33, 34, 36, 39, 38, 37, 35,
            40, 41, 42, 44, 47, 46, 45, 43
        ];
        this.fromLetterSchemeRaw = [];
        for (let i = 0; i < this.toLetterSchemeRaw.length; i++) {
            this.fromLetterSchemeRaw[this.toLetterSchemeRaw[i]] = i;
        }

        this.letterSchemeElements = document.querySelectorAll("input.sticker");
        for (let i = 0; i < this.letterSchemeElements.length; i++) {
            this.letterSchemeElements[i].value = this.letterSchemeRaw[i];
        }
        this.letterInput = function(event) {
            if (event.key.length === 1) {
                this.value = event.key.toUpperCase();
            }
            event.preventDefault();
        };

        this.elements = {
            closeConfig: document.getElementById("close-config"),
            openConfig: document.getElementById("open-config"),
            trainerConfig: document.getElementById("trainer-config"),
            edgeMethod: document.getElementById("edge-method-select"),
            edgeBuffer: document.getElementById("edge-buffer"),
            cornerMethod: document.getElementById("corner-method-select"),
            cornerBuffer: document.getElementById("corner-buffer"),
            nextScramble: document.getElementById("next-scramble")
        };

        this.events = {
            nextScramble: [],
            closeConfig: [],
            invoke(eventName) {
                for (let i = 0; i < this[eventName].length; i++) {
                    this[eventName][i]();
                }
            }
        };

        this.settings = {
            letterScheme: "AABBCCDDEEFFGGHHIIJJKKLLMMNNOOPPQQRRSSTTUUVVWWXX",
            edgeMethod: "3-style",
            cornerMethod: "3-style",
            edgeBuffer: "C",
            cornerBuffer: "C"
        };

        // Formatted [element, eventType, function] or [elementArray, eventType, function]
        this.eventListeners = [
            [this.letterSchemeElements, "keydown", this.letterInput],
            [this.elements.closeConfig, "click", () => {
                this.elements.trainerConfig.style.display = "none";
                this.refresh();
                this.save();
                this.events.invoke("closeConfig");
            }],
            [this.elements.openConfig, "click", () => {
                this.elements.trainerConfig.style.display = "block";
            }],
            [[this.elements.cornerBuffer, this.elements.edgeBuffer], "keydown", this.letterInput],
            [this.elements.nextScramble, "click", () => {
                this.events.invoke("nextScramble");
            }]
        ];

        this.load();
        this.updateElements();
    }
    addEventListeners() {
        for (let i = 0; i < this.eventListeners.length; i++) {
            let eventType = this.eventListeners[i][1];
            let eventFunction = this.eventListeners[i][2];
            if (this.eventListeners[i][0] instanceof NodeList || this.eventListeners[i][0] instanceof Array) {
                let elementArray = this.eventListeners[i][0];
                for (let j = 0; j < elementArray.length; j++) {
                    elementArray[j].addEventListener(eventType, eventFunction);
                }
            } else {
                this.eventListeners[i][0].addEventListener(eventType, eventFunction);
            }
        }
    }
    removeEventListeners() {
        for (let i = 0; i < this.eventListeners.length; i++) {
            let eventType = this.eventListeners[i][1];
            let eventFunction = this.eventListeners[i][2];
            if (this.eventListeners[i][0] instanceof NodeList || this.eventListeners[i][0] instanceof Array) {
                let elementArray = this.eventListeners[i][0];
                for (let j = 0; j < elementArray.length; j++) {
                    elementArray[j].removeEventListener(eventType, eventFunction);
                }
            } else {
                this.eventListeners[i][0].removeEventListener(eventType, eventFunction);
            }
        }
    }
    subscribe(eventName, func) {
        this.events[eventName].push(func);
    }
    unsubscribe(eventName, func) {
        for (let i = 0; i < this.events[eventName].length; i++) {
            if (this.events[eventName][i] === func) {
                this.events.splice(i, 1);
                return;
            }
        }
    }
    save() {
        let keys = [];
        for (let key in this.settings) {
            keys.push(key);
            window.localStorage.setItem(key, this.settings[key]);
        }
        window.localStorage.setItem("keys", keys.join(","));
    }
    load() {
        let keysString = window.localStorage.getItem("keys");
        if (!keysString) return;
        let keys = keysString.split(",");
        for (let key of keys) {
            this.settings[key] = window.localStorage.getItem(key);
        }
    }
    refresh() {
        // Letter scheme
        let rawLetterArray = [];
        for (let i = 0; i < this.letterSchemeElements.length; i++) {
            rawLetterArray.push(this.letterSchemeElements[i].value);
        }
        this.letterSchemeRaw = rawLetterArray.join("");
        
        let letterArray = [];
        for (let i = 0; i < this.letterSchemeRaw.length; i++) {
            letterArray[this.fromLetterSchemeRaw[i]] = this.letterSchemeRaw[i];
        }
        this.settings.letterScheme = letterArray.join("");

        // Simple settings
        this.settings.edgeMethod = this.elements.edgeMethod.value;
        this.settings.edgeBuffer = this.elements.edgeBuffer.value;
        this.settings.cornerMethod = this.elements.cornerMethod.value;
        this.settings.cornerBuffer = this.elements.cornerBuffer.value;
    }
    updateElements() {
        // Letter scheme
        for (let i = 0; i < this.letterSchemeElements.length; i++) {
            this.letterSchemeElements[i].value = this.settings.letterScheme[this.fromLetterSchemeRaw[i]];
        }

        // Simple settings
        this.elements.edgeMethod.value = this.settings.edgeMethod;
        this.elements.edgeBuffer.value = this.settings.edgeBuffer;
        this.elements.cornerMethod.value = this.settings.cornerMethod;
        this.elements.cornerBuffer.value = this.settings.cornerBuffer;
    }
}