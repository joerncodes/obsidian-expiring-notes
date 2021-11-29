import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, FrontMatterCache, DropdownComponent, normalizePath } from 'obsidian';
import Archive from 'src/archive';
import Collector from 'src/collector';
import ConfirmModal from 'src/confirm';
import { MESSAGE_CONFIRM_ARCHIVE, MESSAGE_CONFIRM_DELETION, BEHAVIOR_ARCHIVE, BEHAVIOR_DELETE, EXPIRY_DATE_PROMPT, EXPIRY_DATE_DESC, MESSAGE_CONFIRM_DELETION_SINGULAR, MESSAGE_CONFIRM_ARCHIVE_SINGULAR } from 'src/constants';
import ExpiringNotesSettingTab from 'src/settings';
import FrontmatterParser from 'src/frontmatterparser';
import * as chrono from 'chrono-node';
import { ExpiryDatePromptModal } from 'src/expirydatepromptmodal';

interface ExpiringNotesSettings {
	frontmatterKey: string;
	behavior: string;
	checkOnStartup: boolean;
	archivePath: string;
	confirm: boolean;
	dateFormat: string;
}

const DEFAULT_SETTINGS: ExpiringNotesSettings = {
	frontmatterKey: 'expires',
	behavior: BEHAVIOR_DELETE,
	checkOnStartup: false,
	archivePath: 'Archive',
	confirm: true,
	dateFormat: 'YYYY-MM-DD'
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
			let modal = new ConfirmModal(this.app, expiredNotes);

			let message:string;
			
			if(this.settings.behavior == BEHAVIOR_DELETE) {
				message = expiredNotes.length == 1 ? MESSAGE_CONFIRM_DELETION_SINGULAR : MESSAGE_CONFIRM_DELETION;
			} else {
				message = expiredNotes.length == 1 ? MESSAGE_CONFIRM_ARCHIVE_SINGULAR : MESSAGE_CONFIRM_ARCHIVE;
			}

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
		if (this.settings.behavior == BEHAVIOR_DELETE) {

			expiredNotes.forEach((file) => {
					this.deleteExpiredNote(file);
			});

			new Notice('Deleted ' + amount + ' expired note(s).');
		}

		if (this.settings.behavior === BEHAVIOR_ARCHIVE) {
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

		try {
			await this.app.vault.createFolder(archive.getArchivePath(file));
		} catch(error) {
			// folder already exists
		}
		
		let destination = archive.getArchivePathWithFile(file);

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

	setExpiryDate() {
		let modal = new ExpiryDatePromptModal(this.app, window.moment().format(this.settings.dateFormat));

		modal.callback = async (value) => {
			let date = chrono.parseDate(value);
			value = window.moment(date).format(this.settings.dateFormat);

			let file = this.app.workspace.getActiveFile();
			let content = await this.app.vault.read(file);

			let parser = new FrontmatterParser(content);
			parser.setFrontmatter(this.settings.frontmatterKey, value);
			let result = parser.saveFrontmatter();
			
			await this.app.vault.modify(file, result);
		};
		modal.open();
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

		this.addCommand({
			id: 'expiring-notes-expiry-date',
			name: 'Set expiry date',
			callback: () => {
				this.setExpiryDate();
			}
		});

		this.addSettingTab(new ExpiringNotesSettingTab(this.app, this));

		if (this.settings.checkOnStartup) {
			this.app.workspace.onLayoutReady(() => {
				this.checkForExpiredNotes();
			});	
		}
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
