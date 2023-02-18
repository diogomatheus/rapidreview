# Rapid Review CLI

[![Build Status](https://github.com/diogomatheus/rapidreview/workflows/Continuous%20integration%20workflow%20%28Node.js%29/badge.svg)](https://github.com/diogomatheus/rapidreview/actions/workflows/continuous-integration.yml)
[![Coverage Status](https://coveralls.io/repos/github/diogomatheus/rapidreview/badge.svg)](https://coveralls.io/github/diogomatheus/rapidreview)
[![NPM Version](https://img.shields.io/npm/v/rapidreview.svg?style=flat)](https://www.npmjs.org/package/rapidreview)
[![Package License](https://img.shields.io/npm/l/rapidreview.svg?style=flat)](https://www.npmjs.org/package/rapidreview)

Rapid Review is a command-line interface (CLI) that supports performing the search step of literature reviews.

Rapid Review was designed to work with [JabRef tool][jabref] through a minimalist workflow, without impacting the decision-making process of researchers.

## Installation

### Prerequisites

Install [Node.js][node.js] (>=12, LTS version) which includes [Node Package Manager][npm]

### NPM Release

```
npm install --global rapidreview
```

### Contributor Local Repository

```
npm install --global .
```

## Usage

### **CLI version option**

**Description:** displays the CLI installed version.

```
rapidreview --version
```

### **CLI help option**

**Description**: describes the CLI commands and options aiming to support the usage.

```
rapidreview --help
```

### **CLI help command**

**Description**: describes the options of a specific command aiming to support the usage.

```
rapidreview help [command]
```

### **CLI prepare command**

**Description**: prepares the analysis fields in each document of the input bib file.

```
rapidreview prepare --input <filepath> --output [filepath]
```

Analysis fields: title_criteria, abstract_criteria, and reading_criteria. These fields are added with the default value 'TO DO'.

The output bib file is annotated with predefined JabRef groups (e.g., pending, included, excluded, etc) to support the analysis step.

### **CLI sanitize command** 

**Description**: marks inconsistent and duplicate documents of the input bib file aiming to agile the analysis.

```
rapidreview sanitize --input <filepath> --output [filepath] --directory <dirpath>
```

No documents are taken from the bib file, this command only handles the analysis fields (i.e., title_criteria, abstract_criteria, and reading_criteria) and the comment field.

* Inconsistent: absence of title, author, or year field(s).

* Duplicate: DOI equivalence or predefined criteria match (i.e., slugified title equivalence and year equivalence).

This command encompasses the activities of the prepare command, i.e., adding analysis fields before sanitizing and annotating the output bib file with predefined JabRef groups.

*Observation: already analyzed documents are ignored, i.e., title_criteria != 'TO DO'. In addition, working directory files that have the same name as the input bib file will be ignored in the analysis.*

### **CLI snowballing command**

**Description**: generates the Scopus URL to support snowballing based on documents selected (i.e., reading_criteria field == YES) in the input bib file and snowballing strategy (backward | forward).

```
rapidreview snowballing --input <filepath> --strategy <string>
```

The benefit of this command is to optimize the researcher's work, which instead of generating bib files per document and snowballing strategy, will now be able to generate only one bib file per strategy, analyzing all selected documents together.

This command is restricted to bib files generated from the Scopus online database.

### **CLI build command**

**Description**: builds the release bib file based on documents selected (i.e., reading_criteria field == YES) from the bib files in the working directory.

```
rapidreview build --directory <dirpath>
```

In this scenario, the analysis fields (i.e., title_criteria, abstract_criteria, and reading_criteria) are removed and the output bib file does not have the predefined JabRef groups (e.g., pending, included, excluded, etc).

## JabRef Suggestions

In this section, two customization suggestions for the JabRef tool are presented in order to optimize the researcher's work.

### Columns (i.e., options > preferences > entry table)

This customization aims to simplify JabRef's document list presentation, inserting the analysis fields as columns to enable a more effective analysis, avoiding improper filling.

```
linked_id
field:entrytype
field:author
field:title
field:year
field:title_criteria
field:abstract_criteria
field:reading_criteria
```

### Tabs (i.e., options > preferences > custom editor tabs)

This customization aims to facilitate the analysis fields filling, creating a specific tab called 'Analysis' in JabRef's document editor.

```
General:doi;crossref;keywords;eprint;url;file;groups;owner;timestamp;printed;priority;qualityassured;ranking;readstatus;relevance
Abstract:abstract
Analysis:title_criteria;abstract_criteria;reading_criteria
Comments:comment
```

## Code of Conduct

Help us keep the project open and inclusive. Please read and follow our [Code of Conduct][codeofconduct].

**Love Rapid Review CLI? Give our repo a star.**

[jabref]: https://www.jabref.org/
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/get-npm
[codeofconduct]: CODE_OF_CONDUCT.md