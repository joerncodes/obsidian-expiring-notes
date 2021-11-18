# Expiring Notes

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/joerncodes/obsidian-expiring-notes?style=for-the-badge&sort=semver)](https://github.com/joerncodes/obsidian-expiring-notes/releases/latest)
![GitHub All Releases](https://img.shields.io/github/downloads/joerncodes/obsidian-expiring-notes/total?style=for-the-badge)



An [Obsidian](https://obsidian.md) plugin to automatically delete or archive notes that have "expired". With this, you can give your notes a "best by" date and make them disappear as soon as they're obsolete, keeping your vault clean and uncluttered.

Example for those ephemeral notes include:

- information that is only valid for a certain time
- coupon and voucher codes with an expiry date
- any information you just jotted down quickly that won't be important in a day or two
- any ephemeral information you want to dump into your vault
- if you're feeling lucky: set the expiry date on your novel draft to the end of November. Either it's done by then, or...

## Installation

As this plugin is currently in early development, you can use [BRAT](https://github.com/TfTHacker/obsidian42-brat) to install it. Use the path `joerncodes/obsidian-expiring-notes`.

If you're interested in helping to make Expiring Notes a finished product, please see [Contributing](#contributing).

## How to make a note expire

To mark a note to expire in the future, use a predefined frontmatter key like so:

```yaml
expires: 2021-01-01
```

In this example, this note will automatically be either archived or deleted after January 1st, 2021.

## Archive / Delete

Expiring Notes has two different modes of operation: delete and archive.

If a note gets deleted, it vanishes from your vault forever - there is no undo. Please use with appropriate caution.

If a note is archived, it gets moved to a predefined archive folder (you can customize the path in settings). Please note that if a file with the same name already exists in the archive, it will get overwritten. 

## Commands

### Set Expiry Date

Use this command to set or modify the expiry date of the currently opened note.

### Check for expired notes

Scan your vault for expired notes and then either delete or archive them, depending on the behavior you set in your [Settings](#Settings).

## Settings

<dl>
  <dt>Frontmatter key</dt>
  <dd>This is the key you use to provide an expiry date. The default is 'expires'.</dd>
  <dt>Date format</dt>
  <dd>Used to specify the date format you want to write your expiry dates in. Visit <a href="https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/">momentjs.com</a> for a list of possible date tokens.</dd>
  <dt>Check for expired notes at startup</dt>
  <dd>If this is enabled, Expiring Notes will collect all expired notes when you start Obsidian.</dd>
  <dt>Enable confirm dialogue</dt>
  <dd>If this is enabled, Expiring Notes will ask you if the expired notes it found should be archived/deleted now.</dd>
  <dt>Behavior</dt>
  <dd>Choose if your notes should be <em>deleted</em> (this has no undo) or moved to a predefined archive folder. Please note that files with the same name will overwrite older files in your archive folder.</dd>
  <dt>Archive folder path</dt>
  <dd>Provide the folder path for your archive (relative to your Obsidian vault root.</dd>
</dl>

## Changelog

You can find the [changelog here](changelog.md).

## Contributing

I'm hoping to make Expiring Notes as awesome as possible, and I need your help to do it. Any issue opened here on GitHub is appreciated, whether it be a bug or a feature request. 

If you want to take the time to do a PR, those are welcomed with open arms.