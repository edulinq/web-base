# EduLinq Web Template

This project serves as the recommended starting place for EduLinq web projects.
It provides common tooling, style, and suggestions for our projects.

Additionally, this project comes with a sample site ([available here](https://edulinq.github.io/web-base/))
that uses many of the components in this project.

## Installation / Usage

Aside from the raw source,
compiled (minified and unminified) resources are [released in GitHub](https://github.com/edulinq/web-base/releases).
All JS and CSS are compiled into one respective file.
The JS file is an [ES module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), thus the `.msj` extension.
The compiled bundles include all dependencies.

See the [sample site](./sample) for an example of using the compiled resources.

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

Here are several design principles that we try to keep with this project:
 - Simplicity
   - Always try and follow the [KISS principle](https://en.wikipedia.org/wiki/KISS_principle).
 - Selective with Dependencies
   - Dependencies must be open source.
   - Dependencies must be vendored.
 - Offline Availability
   - Everything must be able to work offline/locally.
 - Lightweight
   - Try to avoid bloat.
 - Extensible
   - Don't lock people into one way to do things, this is a library not a directive.
