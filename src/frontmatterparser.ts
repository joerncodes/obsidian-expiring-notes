import * as jsyaml from 'src/js-yaml';

export default class FrontmatterParser
{
    private content: string;
    private frontmatter;

    constructor(content: string) {
        this.content = content;
        let startInd = content.indexOf('---') + 4;
        let endInd = content.substring(startInd).indexOf('---') - 1;
        let rawFrontmatter = content.substring(startInd, startInd + endInd);
    
        this.frontmatter = jsyaml.load(rawFrontmatter);
    }

    setFrontmatter(key: string, value: any): FrontmatterParser {
        this.frontmatter[key] = value;
        return this;
    }

    saveFrontmatter(): string
    {
        let dump = jsyaml.dump(this.frontmatter);
        return '---\n' + dump + this.content.substring(this.content.lastIndexOf('---'));
    }
}