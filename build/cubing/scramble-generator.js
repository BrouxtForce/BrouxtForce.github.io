import { Scramble } from "./scramble.js";
const algOutput = document.getElementById("scramble-output");
const scramble = Scramble.Cube444.centersOnly(20);
algOutput.textContent = scramble.toString();
