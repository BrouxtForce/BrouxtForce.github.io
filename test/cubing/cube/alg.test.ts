import { Alg } from "../../../build/cubing/cube/alg";

describe("Token generation validation", () => {
    test("Missing opening/closing paranthesis should throw an error.", () => {
        const testStrings = ["[", "]", "(", ")"];
        for (const string of testStrings) {
            expect(() => Alg.fromString(string)).toThrow();
        }
    });
    test("Mismatching open and closed brackets/parenthesis should throw an error", () => {
        const testStrings = ["[)", "(]", "((])", "[[)]"];
        for (const string of testStrings) {
            expect(() => Alg.fromString(string)).toThrow();
        }
    });

    const testStrings = "acghijknopqtvw+-?<>`~\"\\!@#$%^&*=_".split("");
    for (const string of testStrings) {
        test(`Invalid character '${string}' should throw an error`, () => {
            expect(() => Alg.fromString(string)).toThrow();
        });
    }
});