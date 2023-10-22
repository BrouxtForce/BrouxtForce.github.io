/// <reference types="bun-types" />

export {}

const result = await Bun.build({
    entrypoints: [
        "src/templates.ts",
        "src/settings/index.ts",
        "src/cubing/cubing-templates.ts",
        "src/cubing/lse-trainer.ts",
        "src/cubing/solution-editor.ts",
        "src/cubing/timer/index.ts",
        "src/cubing/bld-exec-trainer.ts",
        "src/chess/chess-templates.ts",
        "src/chess/opening-trainer.ts"
    ],
    root: "src",
    outdir: "build",
    splitting: true,
    minify: false
});

if (!result.success) {
    for (const log of result.logs) {
        console.error(log);
    }
}