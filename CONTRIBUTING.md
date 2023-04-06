# Contributing to Syrin Control

Welcome to Syrin Control project!
We are excited to have you contribute to this module.
This file contains information on how to get started with contributing to the project.

## Getting Started

To get started with contributing to the project, you'll need to:

1. Clone the repository.
2. Follow instructions in this document [[https://github.com/frondeus/fvtt-syrin-control/blob/next/docs/how_to_setup_dev.md]].

## Contributing code

If you're interested in contributing code to the project please follow these guidelines:

1. Submit a pull request with your changes.
2. Follow the test practices and formatting guidelines outlined below:

### Running tests

The project is (not fully yet) covered with component tests and end-to-end tests.
To ensure that the new features do not break existing code, and that everything works exactly as expected please
cover your feature with tests.

The rule is simple:

- All new code should be covered in component (using Jest framework) tests, that check all possible scenarios, like "if soundset exists"
  or "if user loses access". We aim to have at least 75% of coverage in new code.
- At least one E2E test (using Cypress framework) that only checks the most popular green path.

#### Note

> Our E2E tests are not ran on CI, because it would violate the LICENSE of foundry. Therefore, maintainer would usually run those before merging PR
> as well as before releasing new version to the public

### Formatting the code

In this project we keep the code clean and formatted. Fortunately there are tools that do the job for us. Therefore remember to run:

```
npm run format
```

before commiting your work.

## Areas Needing Attention

If you're not sure where to start, we could use help with the following areas:

- Documentation updates - since 0.4.0 release there was a massive overhaul of how SyrinControl works, therefore we need to update gifs, how-tos and guides.
- Writing E2E tests that cover happy paths in the module - to ensure we never break one thing by introducing another.

## Reporting Issuess

If you come across any bugs or issues, please report them using the project's issue tracker.
When filling a report, please include the following information:

- Steps to reproduce the issue - the more detailed the better
- Expected behavior
- Screenshots of your problem
- Which operating system you are running
- Which browser
- What is foundry VTT version
- What is SyrinControl version
- Are there any error messages or console output

Those details are incredibly useful to us so we can properly debug the issue. Vague or incomplete bug reports are hard to reproduce.

## Contacting us

If you have any questions or would like to get involved with the project in other ways, please free to contact me at frondeus@gmail.com or via Discord: Frondeus#6975
