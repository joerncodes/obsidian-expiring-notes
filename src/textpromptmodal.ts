import { App, Modal } from "obsidian";
import { EXPIRY_DATE_PROMPT } from "./constants";

export abstract class TextPromptModal extends Modal {
    protected promptEl: HTMLInputElement;
    protected div: HTMLDivElement;
    protected form: HTMLFormElement;
    
    public callback: (value: string) => void;

    constructor(
        app: App,
        protected prompt: string,
        protected defaultValue: string,
        protected placeholder: string
    ) {
        super(app);
    }

    abstract constructUi(): void;

    onOpen(): void {
        this.titleEl.setText(this.prompt);
        this.div = this.contentEl.createDiv();

        this.constructUi();

        this.form = this.div.createEl('form');
        this.form.type = 'submit';
        this.form.onsubmit = (e: Event) => {
            e.preventDefault();
            this.callback(this.promptEl.value);
            this.close();
        };

        this.promptEl = this.form.createEl('input');
        this.promptEl.placeholder = this.placeholder;
        this.promptEl.type = 'text';
        this.promptEl.addClass('expiring-notes-text-input');
        this.promptEl.value = this.defaultValue ?? "";
        this.promptEl.select();
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
