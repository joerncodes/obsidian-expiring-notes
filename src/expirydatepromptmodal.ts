import { App } from "obsidian";
import { EXPIRY_DATE_DESC, EXPIRY_DATE_LINK, EXPIRY_DATE_LINK_TEXT, EXPIRY_DATE_PLACEHOLDER, EXPIRY_DATE_PROMPT } from "./constants";
import { TextPromptModal } from "./textpromptmodal";

export class ExpiryDatePromptModal extends TextPromptModal
{
    
    constructor(
        app: App,
        defaultValue: string
    ) {
        super(
            app,
            EXPIRY_DATE_PROMPT,
            defaultValue,
            EXPIRY_DATE_PLACEHOLDER
        );
    }

    constructUi(): void {
        let p = this.div.createEl('p');
        p.createEl('span', { text: EXPIRY_DATE_DESC });
        p.createEl('a', {
            href: EXPIRY_DATE_LINK,
            text: EXPIRY_DATE_LINK_TEXT
        });
    }
        
}