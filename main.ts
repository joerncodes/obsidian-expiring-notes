import { Moment } from 'moment';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, FrontMatterCache, DropdownComponent, normalizePath } from 'obsidian';
import ExpiringNotesSettingTab from 'src/Settings';

// Remember to rename these classes and interfaces!

interface ExpiringNotesSettings {
	frontmatterKey: string;
	behavior: string;
	checkOnStartup: boolean;
	archivePath: string;
}

const DEFAULT_SETTINGS: ExpiringNotesSettings = {
	frontmatterKey: 'expires',
	behavior: 'delete',
	checkOnStartup: false,
	archivePath: 'Archive'
}

export default class ExpiringNotesPlugin extends Plugin {
	settings: ExpiringNotesSettings;

	async checkForExpiredNotes() {
		let expiredNotes = this.collectExpiredNotes();
		let amount = expiredNotes.length;

		if (this.settings.behavior === 'delete') {

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
		let root = this.app.vault.getRoot().path;
		let destination = normalizePath(root + this.settings.archivePath + '/' + file.basename + '.' + file.extension);

		if (file.path == destination) {
			return false;
		}

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

	collectExpiredNotes(): TFile[] {
		let collected: TFile[] = [];
		let now = window.moment();

		let allFiles = this.app.vault.getMarkdownFiles();

		allFiles.forEach((file) => {
			const metadata = this.app.metadataCache.getFileCache(file);
			if(typeof metadata.frontmatter === 'undefined') {
				return;
			}

			if (this.settings.frontmatterKey in metadata.frontmatter) {
				let expiryDateString = metadata.frontmatter[this.settings.frontmatterKey];
				let fileDate = window.moment(expiryDateString);


				if (fileDate.isBefore(now)) {
					collected.push(file);
				}
			}
		});
		
		return collected;
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
