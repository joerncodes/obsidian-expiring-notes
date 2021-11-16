import * as exp from 'constants';
import { Moment } from 'moment';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, FrontMatterCache, DropdownComponent, normalizePath } from 'obsidian';
import Archive from 'src/archive';
import Collector from 'src/collector';
import ConfirmModal from 'src/confirm';
import { MESSAGE_CONFIRM_ARCHIVE, MESSAGE_CONFIRM_DELETION } from 'src/messages';
import ExpiringNotesSettingTab from 'src/settings';

// Remember to rename these classes and interfaces!

interface ExpiringNotesSettings {
	frontmatterKey: string;
	behavior: string;
	checkOnStartup: boolean;
	archivePath: string;
	confirm: boolean;
}

const DEFAULT_SETTINGS: ExpiringNotesSettings = {
	frontmatterKey: 'expires',
	behavior: 'delete',
	checkOnStartup: false,
	archivePath: 'Archive',
	confirm: true
}

export default class ExpiringNotesPlugin extends Plugin {
	settings: ExpiringNotesSettings;

	async checkForExpiredNotes() {
		let collector = new Collector(this);
		let expiredNotes = collector.collectExpiredNotes();
		let amount = expiredNotes.length;

		if (!amount) {
			return;
		}


		if(this.settings.confirm) {
			let modal = new ConfirmModal(this.app);
			let message = this.settings.behavior == 'delete' 
				? MESSAGE_CONFIRM_DELETION
				: MESSAGE_CONFIRM_ARCHIVE;
			message = message.replace('%s', amount.toString());
			modal.message = message;

			modal.callback = (response: boolean) => {
				if(response) {
					this.handleExpiredNotes(expiredNotes);
				}
			};
			modal.open();
			return;
		}

		this.handleExpiredNotes(expiredNotes);
	}

	async handleExpiredNotes(expiredNotes: TFile[]) {
		let amount = expiredNotes.length;
		if (this.settings.behavior == 'delete') {

			expiredNotes.forEach((file) => {
					this.deleteExpiredNote(file);
			});

			new Notice('Deleted ' + amount + ' expired note(s).');
		}

		if (this.settings.behavior === 'archive') {
			await expiredNotes.forEach(async (file) => {
				if(!await this.archiveExpiredNote(file)) {
					amount--;
				}
			});

			if(amount) {
				new Notice('Archived  ' + amount + ' expired note(s).');
			}
		}
	}

	async archiveExpiredNote(file: TFile): Promise<boolean> {
		let archive = new Archive(this);
		let destination = archive.getArchivePathForFile(file);

		let previousFile = this.app.vault.getAbstractFileByPath(destination);
		if(previousFile) {
			this.app.vault.delete(previousFile);
		}
		
		await this.app.fileManager.renameFile(file, destination);
		return true;
	}

	deleteExpiredNote(file: TFile): void {
		this.app.vault.delete(file);
	}

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'expiring-notes-check',
			name: 'Check for expired notes',
			callback: () => {
				this.checkForExpiredNotes();
			}
		});

		this.addSettingTab(new ExpiringNotesSettingTab(this.app, this));

		if (this.settings.checkOnStartup) {
			this.app.workspace.onLayoutReady(() => {
				this.checkForExpiredNotes();
			});	
		}
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
