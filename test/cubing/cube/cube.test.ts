import fs from "fs";

import { Cube } from "../../../build/cubing/cube/cube";
import { Alg } from "../../../build/cubing/cube/alg";
import { Move } from "../../../build/cubing/cube/move";

// import { reconstructions } from "../reconstructions";

interface Reconstruction {
    link: string;
    solver: string;
    event: string;
    puzzle: number;
    result: number;
    scramble: string;
    solution: string;
}

const reconstructions = JSON.parse(fs.readFileSync("test/cubing/cubesolves-recons.json").toString()) as Reconstruction[];

describe("Cube move validation through reconstructions", () => {
    test("There should be at least 1 reconstruction to test", () => {
        expect(reconstructions.length).toBeGreaterThanOrEqual(1);
    });

    test("new Cube() should be solved", () => {
        for (let i = 2; i <= 7; i++) {
            const cube = new Cube(i);
            expect(cube.solved()).toBe(true);
        }
    });

    test("All 24 rotation combinations of solved cube should be solved.", () => {
        const cube = new Cube(3);
        const alg = new Alg([]);
        const moves = alg.nodes;

        let rotations = [ "x", "x'", "x2", "y", "y'", "y2", "z", "z'", "z2" ];
        for (let i = 0; i < 9; i++) {
            moves[0] = Move.fromString(rotations[i]);

            for (let j = 0; j < 8; j++) {
                moves[1] = Move.fromString(rotations[(j > i) ? (j + 1) : j]);

                cube.solve();
                cube.execute(alg);
                expect(cube.solved()).toBe(true);
            }
        }
    });

    for (const recon of reconstructions) {
        if (!recon.scramble) {
            continue;
        }

        const cube = new Cube(recon.puzzle);
        const scramble = Alg.fromString(recon.scramble);
        const solution = Alg.fromString(recon.solution);

        test(`Reconstruction '${recon.link}' scramble should not end solved.`, () => {
            cube.solve();
            cube.execute(scramble);

            expect(cube.solved()).toBe(false);
        });

        test(`Reconstruction '${recon.link}' solution should not end solved.`, () => {
            cube.solve();
            cube.execute(solution);

            expect(cube.solved()).toBe(false);
        });

        test(`Reconstruction '${recon.link}' should end solved.`, () => {
            cube.solve();
            cube.execute(scramble);
            cube.execute(solution);

            expect(cube.solved()).toBe(true);
        });
    }
});