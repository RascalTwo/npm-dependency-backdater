# NPM Dependency Backdater

![package version badge](https://img.shields.io/badge/npm--dependency--backdater-v2.1.1-blue) ![code coverage badge](https://img.shields.io/badge/coverage-100%25-lime)

A tool to update NPM dependencies to the latest version available at a specified date.

For most people they could simply look at their version control history and see what the latest version was on a given date, but if you don't have that luxury, this tool will help you out.

## Usage

```bash
npm install -g RascalTwo/npm-dependency-backdater
npm-dependency-backdater package.json 2023-01-01
```

## Options

```bash
npm-dependency-backdater <package.json location> <datetime> [--silent] [--strip-prefixes] [--interactive] [--allow-pre-release] [--dry-run]

package.json location: The location of the package.json file to update
datetime: The datetime to update the package versions to (YYYY-MM-DDTHH:mm:ssZ)
```

- `--silent`
  - Whether to suppress logging
- `--strip-prefixes`
  - Whether to strip the (>=, <=, >, <, ~, ^) prefixes from the updated versions
- `--interactive`
  - Whether to prompt the user before updating each package version
- `--allow-pre-release`
  - Whether to allow the latest version to be a pre-release version (e.g. 1.0.0-alpha.1)
- `--dry-run`
  - Whether to log the changes that would be made without actually making them

## How it works

This tool uses the [NPM registry API](https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md) to get the versions and release dates of each package, and then updates the package.json file with the latest version available at the specified date.

> It intelligently caches the NPM registry API responses, so that it doesn't have to make a request for packages it already knows about - and will only make requests when they're unknown or when the specified date is newer than the cached date.

## How it's made

This tool is written in [TypeScript](https://www.typescriptlang.org/), and uses the [`node-fetch`](https://www.npmjs.com/package/node-fetch) package to make HTTP requests.

Fully following Test-Driven-Development via [`jest`](https://jestjs.io/), with [`eslint`](https://eslint.org/) and [`prettier`](https://prettier.io/) maintaining code consistency - and [`husky`](https://www.npmjs.com/package/husky) to ensure these tools are not forgotten.

## Future plans

- Prettier logging and live display of the progress.
- Locking within (major, minor, patch) versions, to prevent breaking changes.
