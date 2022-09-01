# Rapid Review CLI

A command-line interface (CLI) to support rapid review studies.

## Installation

### Prerequisites

Install [Node.js][node.js] which includes [Node Package Manager][npm]

### NPM Release

```
npm install --global rapidreview
```

### Contributor Local Repository

```
npm install --global .
```

## Usage

**Rapid Review CLI help:** Describes the CLI options and commands aiming to support the usage.

```
rapidreview --help
```

**Rapid Review CLI version:** Displays the CLI installed version.

```
rapidreview --version
```

**Rapid Review CLI prepare command:** Prepares the analysis fields in each document of the input bib file.

```
rapidreview prepare --input <filepath> --output [filepath]
```

**Rapid Review CLI sanitize command:** Marks inconsistent and duplicate documents of the input bib file aiming to agile the analysis.

```
rapidreview sanitize --input <filepath> --output [filepath] --directory <dirpath>
```

**Rapid Review CLI snowballing command:** Generates the Scopus URL to support snowballing based on documents selected in the input bib file and snowballing strategy (backward | forward).

```
rapidreview snowballing --input <filepath> --strategy <string>
```

**Rapid Review CLI build command:** Builds the release bib file based on documents selected from the bib files in the working directory.

```
rapidreview build --directory <dirpath>
```

**Rapid Review CLI help command:** Describes the command options aiming to support the usage.

```
rapidreview help [command]
```

## Code of Conduct

Help us keep the project open and inclusive. Please read and follow our [Code of Conduct][codeofconduct].

**Love Rapid Review CLI? Give our repo a star.**

[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/get-npm
[codeofconduct]: CODE_OF_CONDUCT.md