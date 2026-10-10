# EduLinq Web Template

This project serves as the recommended starting place for EduLinq web projects.
It provides common tooling, style, and suggestions for our projects.

## Installation

TODO

## Development

This project uses Node.
Install development dependencies with:
```
npm install .
```

To create a development build, use:
```
./scrupts/build.sh
```

Use `--prod` to make it a production build:
```
./scrupts/build.sh --prod
```

The build process places output into the `dist` directory.

The build process also creates a sample website from the `sample` directory.
Only a simple webserver is required for the sample website,
so there are many ways to view it.
For example:
```
./node_modules/.bin/serve dist/sample/dev
```

To runs tests, use the `scripts/run_tests.sh` script:
```
./scripts/run_tests.sh
```

Any parameters are passed directly to `npm test`.
So, you can do things like run a single test ('SampleTest') with:
```
./scripts/run_tests.sh -t SampleTest
```

## Design Goals

TEST

Simplicity

Limited Dependencies
 - Open Source
 - Vendored

Lightweight

Extensible
