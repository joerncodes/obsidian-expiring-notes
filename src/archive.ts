import ExpiringNotesPlugin from "main";
import { normalizePath, TFile } from "obsidian";

export default class Archive {
    plugin: ExpiringNotesPlugin;
    
    constructor(plugin: ExpiringNotesPlugin) {
        this.plugin = plugin;
    }

    getArchivePathForFile(file: TFile): string {
        let root = this.plugin.app.vault.getRoot().path;
		return normalizePath(root + this.plugin.settings.archivePath + '/' + file.basename + '.' + file.extension);
    }

    isFileArchived(file: TFile): boolean {
        let archivePath = this.getArchivePathForFile(file);
        return file.path == archivePath;
    }
}