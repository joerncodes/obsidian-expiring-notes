import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, FrontMatterCache, DropdownComponent, normalizePath } from 'obsidian';
import Archive from 'src/archive';
import Collector from 'src/collector';
import ConfirmModal from 'src/confirm';
import { MESSAGE_CONFIRM_ARCHIVE, MESSAGE_CONFIRM_DELETION, BEHAVIOR_ARCHIVE, BEHAVIOR_DELETE, EXPIRY_DATE_PROMPT } from 'src/constants';
import ExpiringNotesSettingTab from 'src/settings';
import { TextPromptModal } from 'src/textpromptmodal';
import * as jsyaml from 'src/js-yaml';
import FrontmatterParser from 'src/frontmatterparser';

// Remember to rename these classes and interfaces!

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
			let message = this.settings.behavior == BEHAVIOR_DELETE
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
		let prompt = EXPIRY_DATE_PROMPT.replace('%s', this.settings.dateFormat);
		let modal = new TextPromptModal(this.app, prompt, window.moment().format(this.settings.dateFormat));
		modal.callback = async (value) => {
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

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
