import { Alg } from "../cube/alg.js";
export class AlgTextarea extends HTMLElement {
    constructor() {
        super();
        this.animationFrame = 0;
        this.textarea = document.createElement("textarea");
        this.textarea.placeholder = "Click here to add moves";
        this.textarea.rows = 1;
        this.textarea.spellcheck = false;
        this.textarea.addEventListener("input", () => {
            window.cancelAnimationFrame(this.animationFrame);
            this.animationFrame = window.requestAnimationFrame(() => {
                try {
                    const parsedAlg = Alg.fromString(this.textarea.value);
                    this.dispatchEvent(new CustomEvent("alg-parse", { detail: parsedAlg }));
                    this.textarea.classList.remove("invalid");
                    this.errorDiv.style.display = "";
                }
                catch (error) {
                    this.textarea.classList.add("invalid");
                    this.errorDiv.textContent = error;
                    this.errorDiv.style.display = "block";
                }
            });
        });
        this.errorDiv = document.createElement("div");
        this.errorDiv.classList.add("error-message");
    }
    connectedCallback() {
        this.appendChild(this.textarea);
        this.appendChild(this.errorDiv);
        if (!document.querySelector("link#alg-textarea")) {
            const link = document.createElement("link");
            link.id = "alg-textarea";
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = "/src/cubing/templates/alg-textarea.css";
            document.head.appendChild(link);
        }
    }
    static get observedAttributes() {
        return ["min-rows"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "min-rows":
                let number = Number.parseInt(newValue);
                if (!isNaN(number)) {
                    this.textarea.rows = number;
                }
                break;
        }
    }
}
customElements.define("alg-textarea", AlgTextarea);
