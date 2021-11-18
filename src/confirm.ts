import { App, ButtonComponent, Modal, TFile } from 'obsidian';
import { CONFIRM_MODEL_TITLE } from './constants';

export default class ConfirmModal extends Modal {
    message = '';
    confirm = 'Yes';
    cancel = 'No';
    expiredNotes: TFile[];

    callback: (response: boolean) => void;

	constructor(app: App, expiredNotes: TFile[]) {
		super(app);
    this.expiredNotes = expiredNotes;
	}

	onOpen() {
      this.titleEl.setText(CONFIRM_MODEL_TITLE);
      this.contentEl.empty();
      this.contentEl.createEl('p', { text: this.message });
      
      this.expiredNotes.slice(0,5).forEach(file => {
        this.contentEl.createEl('p', { text: '- ' + file.path});
      });
      if(this.expiredNotes.length > 5) {
        this.contentEl.createEl('p', { text: '...and ' + (this.expiredNotes.length - 5).toString() + ' more'});
      }

      const controls = this.contentEl.createDiv();
      controls.addClass('expiring-notes-buttons-container');
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