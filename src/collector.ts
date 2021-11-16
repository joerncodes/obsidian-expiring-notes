import ExpiringNotesPlugin from "main";
import { App, TFile } from "obsidian";
import Archive from "./archive";

export default class Collector {
    plugin: ExpiringNotesPlugin;
    archive: Archive;
    
    constructor(plugin: ExpiringNotesPlugin) {
        this.plugin = plugin;
        this.archive = new Archive(this.plugin);
    }

    collectExpiredNotes(): TFile[] {
		let collected: TFile[] = [];
		let now = window.moment();

		let allFiles = this.plugin.app.vault.getMarkdownFiles();

		allFiles.forEach((file) => {
			const metadata = this.plugin.app.metadataCache.getFileCache(file);
			if(typeof metadata.frontmatter === 'undefined') {
				return;
			}

			if (this.plugin.settings.frontmatterKey in metadata.frontmatter) {
				let expiryDateString = metadata.frontmatter[this.plugin.settings.frontmatterKey];
				let fileDate = window.moment(expiryDateString, this.plugin.settings.dateFormat);

                if(this.archive.isFileArchived(file)) {
                    return;
                }

				if (fileDate.isBefore(now)) {
					collected.push(file);
				}
			}
		});
		
		return collected;
	}
}