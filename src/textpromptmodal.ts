import { App, Modal } from "obsidian";
import { EXPIRY_DATE_PROMPT } from "./constants";

export class TextPromptModal extends Modal {
    private promptEl: HTMLInputElement;
    public callback: (value: string) => void;

    constructor(
        app: App,
        private prompt: string,
        private desc: string,
        private examples: any[],
        private defaultValue: string
    ) {
        super(app);
    }

    onOpen(): void {
        this.titleEl.setText(this.prompt);
        const div = this.contentEl.createDiv();
        div.createEl('p', { text: this.desc });
        const ul = div.createEl('ul');
        this.examples.shuffle().slice(0, 3).forEach(example => {
            ul.createEl('li', { text: example});
        });

        const form = div.createEl('form');
        form.type = 'submit';
        form.onsubmit = (e: Event) => {
            e.preventDefault();
            this.callback(this.promptEl.value);
            this.close();
        };

        this.promptEl = form.createEl('input');
        this.promptEl.type = 'text';
        this.promptEl.addClass('expiring-notes-text-input');
        this.promptEl.placeholder = EXPIRY_DATE_PROMPT
        this.promptEl.value = this.defaultValue ?? "";
        this.promptEl.select();
    }

    onClose(): void {
        this.contentEl.empty();
    }
}
