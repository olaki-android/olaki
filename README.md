# Olaki

Olaki is a tool that lists alternative operating systems for Android phones.

Android phones are uniquely identified by their codenames.

The generated list is hosted [here](https://olaki-android.github.io/olaki/).

## Architecture overview

Olaki comprises a Node.js app that fetches data from codebases or websites of known alternative OSes for Android.

Data collected for each OS is in the form of a map where keys are unique codenames of compatible Android phones and values are
generic device info and download links where possible.

Those individual OS maps are then merged into an overall one so that all available OSes are listed for a given codename. 

The overall map is output as a JSON file and displayed on a table via GitHub pages.

Rules exist to decide what devices should be added to the overall map based on compatibility level for each OS. See [appConfig.json](./appConfig.json).

## Contributing

Thank you for your interest in the project! You time and effort are really appreciated.

### Code of conduct

This project adheres to a code of conduct so that everyone can contribute in an open, welcoming, diverse, inclusive, and healthy environment.

For more details, please visit [this page](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

### Contributing via pull requests

This codebase is written in Typescript. Feel free to raise a pull request whatever your skill level in that language.

Please also raise an issue to capture context on your pull request. E.g. what bug/improvement/suggestion does your pull request relate to?

### Contributing via other means

Please raise an issue to describe your problem statement.

## Development cycle

### Pre-requisites

Node.js `v16.x.x` and npm `8.x.x`.

### Initial setup

Clone this codebase and run `npm install`.

### Update submodules

`npm run update-submodules`

The `submodules` directory contains clones of some alternative OS project codebases. These can be updated to their respective `HEAD`s at once by running the command above. 

### Lint + fix

`npm run lint`

`npm run fix-lint`

Linting and formatting rules are defined in `.eslintrc.json` and `.prettierrc.json`.

An `.editorconfig` file is also provided for IDEs compatible with that standard.

### Compile TypeScript code to JavaScript

`npm run build`

### Extract device summaries and build public assets

`npm run extract-device-summaries`

If that command runs successfully, you should be able to open in your browser the file `public/index.html` 

### CI / CD

#### On pull request against the `main` branch

The following GitHub workflow steps are run:
- CodeQL analysis
- lint
- build

#### On `push` to the `main` branch (including PR merge)

Additional GitHub workflow steps that are run:
- run the app to extract device summaries
- publish the generated list to the page on GitHub Pages

#### Cron jobs
The following cron jobs are run on the `main` branch:
- CodeQL analysis once a month
- full build + deploy once a month, so that the generated list is regularly updated even when no commits are pushed 

## License

MIT
