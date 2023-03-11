import { Alg } from "../cube/alg.js";

export class AlgTextarea extends HTMLElement {
    private textarea: HTMLTextAreaElement;
    private errorDiv: HTMLDivElement;

    private animationFrame: number = 0;

    constructor() {
        super();

        this.textarea = document.createElement("textarea");
        this.textarea.placeholder = "Click here to add moves";
        this.textarea.rows = 1;
        this.textarea.spellcheck = false;

        this.textarea.addEventListener("input", () => {
            window.cancelAnimationFrame(this.animationFrame);
            this.animationFrame = window.requestAnimationFrame(() => {
                try {
                    const parsedAlg = Alg.fromString(this.textarea.value);
                    this.dispatchEvent(
                        new CustomEvent<Alg>("alg-parse", { detail: parsedAlg })
                    );
                    this.errorDiv.style.display = "none";
                } catch (error: any) {
                    this.errorDiv.style.display = "block";
                    this.errorDiv.textContent = error;
                }
            });
        });

        this.errorDiv = document.createElement("div");
    }
    connectedCallback() {
        // this.innerHTML = `
        //     <textarea rows="1" placeholder="Click here to add moves"></textarea>
        //     <div class="parse-error"></div>
        // `;
        this.appendChild(this.textarea);
        this.appendChild(this.errorDiv);

        // Load the CSS if it hasn't been loaded yet
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
    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
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