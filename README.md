# BrouxtForce.github.io

A website to containing primarily tooling for speedcubing improvement.

## Building
To build, download the zip, `cd` into the project's root directory, and run:

```shell
tsc
```

This type checks the TypeScript files and transpiles the JavaScript files into the `/build` directory.

Alternatively, for faster iteration times, `bun` can optionally be used to transpile TypeScript way faster than `tsc`. That being said, `bun` does not perform typechecking. A simple

```shell
bun build.ts
```

will execute `build.ts`, which runs `Bun.build()`, building the TypeScript source files into the `/build` directory.

## Running
Because this website uses ES modules, a local web server must be set up in the root directory in order to avoid any CORS errors. If you have Python installed, this is very easy. Either run

```shell
python -m http.server
```

or

```shell
python3 -m http.server
```

depending on the operating system.

Once you have a local web server set up, you can simply navigate to `localhost:8000` in your web browser of choise.