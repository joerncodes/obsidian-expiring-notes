import { App, ButtonComponent, Modal } from 'obsidian';
import { CONFIRM_MODEL_TITLE } from './constants';

export default class ConfirmModal extends Modal {
    message = '';
    confirm = 'Yes';
    cancel = 'No';
    callback: (response: boolean) => void;

	constructor(app: App) {
		super(app);
	}

	onOpen() {
      this.titleEl.setText(CONFIRM_MODEL_TITLE);
      this.contentEl.empty();
      this.contentEl.createEl('p', { text: this.message });
      const controls = this.contentEl.createDiv();
      const confirmButton = controls.createEl('button', { text: this.confirm, cls: 'mod-cta' });
      confirmButton.addEventListener('click', () => {
        this.callback(true);
        this.close();
      });
      const cancelButton = controls.createEl('button', { text: this.cancel });
      cancelButton.addEventListener('click', () => {
        this.callback(false);
        this.close();
      });
    }

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}