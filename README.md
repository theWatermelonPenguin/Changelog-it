# changelog-it
<p align="center">
  <img src="changelog-it-icon.svg" alt="Icon" height="200" width="200"/>
</p>


A simple Node.js tool to automatically generate and regenerate your project’s `CHANGELOG.md` based on your git commit history, following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html) conventions.

* * *

## Features

- Parses git commit messages to generate changelog entries grouped by type (Added, Fixed, Changed).
- Supports conventional commit message types: feat, fix, chore, docs, refactor, perf, style, test, breaking.
- Automatically includes release dates from git tags.
- Skips commits by GitHub Actions bot (e.g., automated changelog updates).
- Generates an “Unreleased” section with commits after the latest tag.
- Easy to integrate into your CI/CD pipeline or run locally.

* * *


## Usage

This is meant as a CI tool, so copy this `update.yml` file

```yml
name: Auto Update Changelog

on:
  push:
    branches:
      - master  # or main, adjust as needed
  pull_request:

jobs:
  update-changelog:
    runs-on: ubuntu-latest
    permissions:
      contents: write  # needed to push commits

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
        with: 
            fetch-depth: 0       # fetch entire history

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install package
        run: npm install @thewatermelonpenguin/changelog-it
      - name: Run changelog update script
        run: npx changelog-it

      - name: Commit updated changelog
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add CHANGELOG.md
          git diff --cached --quiet || git commit -m "docs(changelog): update Unreleased section [skip ci]"
          git push
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This will generate your `CHANGELOG.md` file with all tags and unreleased commits.

* * *

## Commit Message Format

The tool expects commit messages following Conventional Commits:
```txt
<type>(optional-scope): description

Examples:

feat: add user login feature  
fix(auth): handle expired tokens  
docs: update README  
chore: update dependencies
```

* * *

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

* * *

## License

MIT © Penguin