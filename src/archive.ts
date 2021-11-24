import ExpiringNotesPlugin from "main";
import { normalizePath, TFile } from "obsidian";

export default class Archive {
    plugin: ExpiringNotesPlugin;
    
    constructor(plugin: ExpiringNotesPlugin) {
        this.plugin = plugin;
    }

    getArchivePath(file: TFile): string {
        let root = this.plugin.app.vault.getRoot().path;
        let archiveDirPath = file.path.replace(file.name, '');
        archiveDirPath = archiveDirPath.replace(this.plugin.settings.archivePath + '/', '');
        
        return normalizePath(
            root 
            + this.plugin.settings.archivePath 
            + '/'
            + archiveDirPath
        );

    }

    getArchivePathWithFile(file: TFile): string {
        let root = this.plugin.app.vault.getRoot().path;
		return normalizePath(
            this.getArchivePath(file)
            + '/'
            + file.name
        );
    }

    isFileArchived(file: TFile): boolean {
        let archivePath = this.getArchivePathWithFile(file);
        return file.path == archivePath;
    }
}