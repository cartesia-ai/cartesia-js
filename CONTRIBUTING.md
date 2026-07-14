## Setting up the environment

This repository uses [`pnpm`](https://pnpm.io/).
Other package managers may work but are not officially supported for development.

To set up the repository, run:

```sh
$ pnpm install
$ pnpm build
```

This will install all the required dependencies and build output files to `dist/`.

## Modifying/Adding code

Most of the SDK is generated code. Modifications to code will be persisted between generations, but may
result in merge conflicts between manual patches and changes from the generator. The generator will never
modify the contents of the `src/lib/` and `examples/` directories.

## Adding and running examples

All files in the `examples/` directory are not modified by the generator and can be freely edited or added to.

```ts
// add an example to examples/<your-example>.ts

#!/usr/bin/env -S npm run tsn -T
…
```

```sh
$ chmod +x examples/<your-example>.ts
# run the example against your api
$ pnpm tsn -T examples/<your-example>.ts
```

## Using the repository from source

If you’d like to use the repository from source, you can either install from git or link to a cloned repository:

To install via git:

```sh
$ npm install git+ssh://git@github.com:cartesia-ai/cartesia-js.git
```

Alternatively, to link a local copy of the repo:

```sh
# Clone
$ git clone https://www.github.com/cartesia-ai/cartesia-js
$ cd cartesia-js

# With yarn
$ yarn link
$ cd ../my-package
$ yarn link @cartesia/cartesia-js

# With pnpm
$ pnpm link --global
$ cd ../my-package
$ pnpm link --global @cartesia/cartesia-js
```

## Running tests

```sh
$ pnpm run test
```

## Linting and formatting

This repository uses [prettier](https://www.npmjs.com/package/prettier) and
[eslint](https://www.npmjs.com/package/eslint) to format the code in the repository.

To lint:

```sh
$ pnpm lint
```

To format and fix all lint issues automatically:

```sh
$ pnpm fix
```

## Publishing and releases

Changes made to this repository via the automated release PR pipeline should be staged on npm automatically. If
the changes aren't made through the automated pipeline, you may want to stage releases manually.

### Stage with a GitHub workflow

You can stage an npm release for approval by using [the `Stage NPM` GitHub action](https://www.github.com/cartesia-ai/cartesia-js/actions/workflows/publish-npm.yml). After reviewing the staged package, a maintainer must approve it on npm before it becomes available from the registry.

### Stage manually

If you need to manually stage a package, you can run the `bin/publish-npm` script with an `NPM_TOKEN` set in
the environment. The command prints the stage ID needed to inspect, approve, or reject the staged package.
