import { Moment } from 'moment';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, FrontMatterCache, DropdownComponent, normalizePath } from 'obsidian';

// Remember to rename these classes and interfaces!

interface ExpiringNotesSettings {
	frontmatterKey: string;
	behavior: string;
}

const DEFAULT_SETTINGS: ExpiringNotesSettings = {
	frontmatterKey: 'expires',
	behavior: 'delete'
}

export default class ExpiringNotesPlugin extends Plugin {
	settings: ExpiringNotesSettings;

	async checkForExpiredNotes() {
		let expiredNotes = this.collectExpiredNotes();

		if (this.settings.behavior === 'delete') {

			expiredNotes.forEach((file) => {
					this.deleteExpiredNote(file);
			});

			new Notice('Deleted ' + expiredNotes.length + ' expired note(s).');
		}

		if (this.settings.behavior === 'trash') {

			expiredNotes.forEach((file) => {
				this.trashExpiredNote(file);
			});

			new Notice('Trashed  ' + expiredNotes.length + ' expired note(s).');
		}
	}

	async trashExpiredNote(file: TFile): Promise<void> {
		let root = this.app.vault.getRoot().path;
		let destination = normalizePath(root + 'Trash/' + file.basename + '.' + file.extension);
		console.log(destination);

		await this.app.fileManager.renameFile(file, destination);
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

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ExpiringNotesSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		this.app.workspace.onLayoutReady(() => {
			this.checkForExpiredNotes();
        });
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

class ExpiringNotesSettingTab extends PluginSettingTab {
	plugin: ExpiringNotesPlugin;

	constructor(app: App, plugin: ExpiringNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Expiring Notes settings'});

		new Setting(containerEl)
			.setName('Frontmatter key')
			.setDesc('Enter the key which you would like to use in your note\'s frontmatter to identify the note\'s expiry date.')
			.addText(text => text
				.setPlaceholder('expires')
				.setValue(this.plugin.settings.frontmatterKey)
				.onChange(async (value) => {
					this.plugin.settings.frontmatterKey = value;
					await this.plugin.saveSettings();
				}));
		
		new Setting(containerEl)
			.setName('Behavior')
			.setDesc('Choose what should happen to your notes once they have expired.')
			.addDropdown((d) => {
				d.addOption("delete", "Delete file");
				d.addOption("trash", "Move to trash folder");
				d.setValue(this.plugin.settings.behavior);
				d.onChange(async (v: "delete" | "trash") => {
					this.plugin.settings.behavior = v;
					await this.plugin.saveSettings();
				});

			});
				
	}
}
