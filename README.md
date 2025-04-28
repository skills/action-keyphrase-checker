# Keyphrase Checker Action 🔎

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/skills/action-keyphrase-checker.svg)](https://github.com/skills/action-keyphrase-checker/releases)
[![Continuous Integration](https://github.com/skills/action-text-variables/actions/workflows/ci.yml/badge.svg)](https://github.com/skills/action-keyphrase-checker/actions/workflows/ci.yml)

Search for keyphrases in text content or files. Validates if a specific phrase
appears a minimum number of times with options for case sensitivity.

## Basic Usage 🚀

### Check for Keyphrase in a File

```yaml
steps:
  - name: Check for required phrase in file
    id: keyphrase-check
    uses: skills/action-keyphrase-checker@v1
    with:
      text-file: 'path/to/file.md'
      keyphrase: 'GitHub'
      case-sensitive: false
      minimum-occurrences: 2
```

### Check for Keyphrase in Direct Text

```yaml
steps:
  - name: Check direct text content
    id: keyphrase-check
    uses: skills/action-keyphrase-checker@v1
    with:
      text: |
        Some text mentioning GitHub Actions and more GitHub Actions conten
      keyphrase: 'GitHub Actions'
      case-sensitive: true
      minimum-occurrences: 2
```

## Inputs ⚙️

| Input                 | Description                                        | Required | Default |
| --------------------- | -------------------------------------------------- | -------- | ------- |
| `text-file`           | Path to a file containing text to check            | No\*     | -       |
| `text`                | Direct text input to check                         | No\*     | -       |
| `keyphrase`           | The phrase to search for in the text               | Yes      | -       |
| `case-sensitive`      | Whether to perform case-sensitive matching         | No       | `false` |
| `minimum-occurrences` | Minimum number of occurrences required for success | No       | `1`     |

> \*Note: You must provide exactly one of `text-file` or `text`.

## Outputs 📤

| Output        | Description                                              |
| ------------- | -------------------------------------------------------- |
| `occurrences` | Number of occurrences of the keyphrase found in the text |

## License 📄

This project is licensed under the MIT License - see the LICENSE file for
details.
