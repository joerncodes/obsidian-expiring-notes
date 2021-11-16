# Expiring Notes

An [Obsidian](https://obsidian.md) plugin to automatically delete or archive notes that have "expired". With this, you can give your notes a "best by" date and make them disappear as soon as they're obsolete, keeping your vault clean and uncluttered.

Example for those ephemeral notes include:

- information that is only valid for a certain time
- coupon and voucher codes with an expiry date
- information you just jotted down that won't be important in a day or two
- any ephemeral information you want to dump into your vault

## How to make a note expire

To mark a note to expire in the future, use a predefined frontmatter key like so:

```yaml
expires: 2021-01-01
```

In this example, this note will automatically be either archived or deleted after January 1st, 2021.

## Archive / Delete

Expiring Notes has two different modes of operation: delete and archive.

If a note gets deleted, it vanishes from your vault forever - there is no undo. Please use with appropriate caution.

If a note is archived, it gets moved to a predefined archive folder (you can customize the path in settings). Please note that if a file with the same name already exists in the archive, it will get overwritten. Also, the archive is flat, meaning that the "path" to your file will not be preserved in archive.

## Settings

<dl>
  <dt>Frontmatter key</dt>
  <dd>This is the key you use to provide an expiry date. The default is 'expires'.</dd>
  <dt>Check for expired notes at startup</dt>
  <dd>If this is enabled, Expiring Notes will collect all expired notes when you start Obsidian.</dd>
  <dt>Enable confirm dialogue</dt>
  <dd>If this is enabled, Expiring Notes will ask you if the expired notes it found should be archived/deleted now.</dd>
  <dt>Behavior</dt>
  <dd>Choose if your notes should be <em>deleted</em> (this has no undo) or moved to a predefined archive folder. Please note that files with the same name will overwrite older files in your archive folder.</dd>
  <dt>Archive folder path</dt>
  <dd>Provide the folder path for your archive (relative to your Obsidian vault root.</dd>
</dl>

## Contributing

Any issue opened here on GitHub is appreciated. PRs are welcomed with open arms.