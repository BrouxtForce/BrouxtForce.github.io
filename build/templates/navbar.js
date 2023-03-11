export class NavBar extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = `
            <div id="nav-bar">
                <a href="/index.html" class="nav-item">Home</a>
                <div class="dropdown">
                    <button class="dropdown-name nav-item">Cubing</button>
                    <div class="dropdown-content">
                        <a href="/cubing/bld-exec-trainer.html" class="dropdown-item">3BLD Execution Trainer</a>
                        <a href="/cubing/solution-editor.html" class="dropdown-item">Solution Editor</a>
                        <a href="/cubing/cube-timer.html" class="dropdown-item">Cube Timer</a>
                    </div>
                </div>
                ${""}
            </div>
        `;
    }
}
customElements.define("nav-bar", NavBar);
