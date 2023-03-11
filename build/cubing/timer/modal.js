export var Modal;
(function (Modal) {
    function createModal() {
        const modal = document.createElement("div");
        modal.classList.add("modal");
        const modalContent = document.createElement("div");
        modalContent.classList.add("modal-content");
        modal.appendChild(modalContent);
        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.classList.add("modal-close");
        modalContent.appendChild(closeButton);
        closeButton.addEventListener("click", () => {
            modal.remove();
        });
        return { modal, modalContent };
    }
    function outputText(text) {
        const { modal, modalContent } = createModal();
        const textDiv = document.createElement("div");
        textDiv.classList.add("modal-output-text");
        textDiv.textContent = text;
        modalContent.appendChild(textDiv);
        return modal;
    }
    Modal.outputText = outputText;
})(Modal || (Modal = {}));
