import { Alg } from "./alg.js";
import { Scramble } from "./scramble.js";

const algOutput = document.getElementById("scramble-output") as HTMLElement;

const scramble = Scramble.Cube444.centersOnly(20);

algOutput.textContent = scramble.toString();