import { FrontmatterEntry } from './frontmatterentry';

export default class FrontmatterParser
{
    private content: string;
    private frontmatter: FrontmatterEntry[];

    constructor(content: string) {
        this.content = content;
        let startInd = content.indexOf('---') + 4;
        let endInd = content.substring(startInd).indexOf('---') - 1;
        let rawFrontmatter = content.substring(startInd, startInd + endInd);
        this.frontmatter = [];

        if(content.indexOf('---') === -1) {
            return;
        }


        rawFrontmatter.split("\n").forEach(line => {
            let parts = line.split(':').map(v => v.trim());
            this.frontmatter.push(new FrontmatterEntry(parts[0].toString(), parts[1]));
        });
    }

    setFrontmatter(key: string, value: any): FrontmatterParser {
        let found = false;
        this.frontmatter.forEach(fm => {
            if(fm.getKey() == key) {
                fm.setValue(value);
                found = true;
            }
        });

        if (!found) {
            this.frontmatter.push(new FrontmatterEntry(key, value));
        }

        return this;
    }

    saveFrontmatter(): string
    {
        let result = '---\n';
        this.frontmatter.forEach(fm => {
            result += fm.getKey() + ': ' + fm.getValue() + '\n';
        });

        // no frontmatter yet
        if(this.content.indexOf('---') === -1) {
            return result + '---\n\n' + this.content;
        }
        
        return result + this.content.substring(this.content.lastIndexOf('---'));
    }
}