import { PluginSettingTab, App, Setting } from "obsidian";
import ExpiringNotesPlugin from "main";

export default class ExpiringNotesSettingTab extends PluginSettingTab {
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
				d.addOption("trash", "Move to archive folder");
				d.setValue(this.plugin.settings.behavior);
				d.onChange(async (v: "delete" | "trash") => {
					this.plugin.settings.behavior = v;
					await this.plugin.saveSettings();
				}
            );
        });

        new Setting(containerEl)
            .setName('Check for expired notes at startup')
            .addToggle((t) => {
                t.setValue(this.plugin.settings.checkOnStartup);
                t.onChange(async (v) => {
                    this.plugin.settings.checkOnStartup = v;
                    await this.plugin.saveSettings();
                });
            });
    }
}
