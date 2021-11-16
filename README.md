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

## Settings

<dl>
  <dt>`frontmatterKey`</dt>
  <dd>This is the key you use to provide an expiry date. The default is 'expires'.</dd>
</dl>

## Contributing

Any issue opened here on GitHub is appreciated. PRs are welcomed with open arms.