// import { BinaryBackground } from "./binary-background.js";

// const main = function(): void {
//     const backgroundCanvas = document.getElementById("background-canvas") as HTMLCanvasElement;
//     backgroundCanvas.width = backgroundCanvas.clientWidth;
//     backgroundCanvas.height = backgroundCanvas.clientHeight;

//     const gl = backgroundCanvas.getContext("webgl2");
//     if (gl === null) {
//         console.error("WebGL2 could not be initialized");
//         return;
//     }

//     const background = new BinaryBackground(gl);

//     const draw = () => {
//         background.render();
//         window.requestAnimationFrame(draw);
//     }
//     draw();
// }
// main();




// import { Alg } from "./cubing/cube/alg.js";

// const alg = Alg.fromString(`
// y'

// // inner x (10 algs)
// [U 3R2 U', 3L'] // 8/8
// [z : [3U', 3L U 3L']] // 8/16
// [3Uw 3R 3Uw', 3L2] // 8/24
// [U' : [3L, U' 3R2 U]] // 9/33
// [D' 3R : [3D', 3R U2 3R']] // 11/44
// [x' : [U' 3L' U, 3R]] // 8/52
// [z : [3L', 3Uw 3R 3Uw']] // 8/60
// [z U : [3L2, 3Uw 3R 3Uw']] // 9/69
// [U' x : [U 3L U', 3R']] // 10/79
// [3U', 3R' U2 3R] // 8/87

// // outer x (8 algs)
// [Uw 2R Uw', 2L2] // 8/95
// [2L', U 2R2 U'] // 8/103
// [5Uw' : [U' 2R2 U, 2L']] // 10/113
// [R : [2D, 2R' U 2R]] // 10/123
// [y' U : [2L2, U 2R U']] // 11/134
// [R : [2U', 2R' U2 2R]] // 10/144
// [U2, 2R 2U' 2R'] // 8/152
// [2R U2 2R', 2D] // 8/160

// // left obliques (7 algs)
// [U : [U 2R2 U', 3L']] // 9/169
// [3L : [U, 3L 2U 3L']] // 9/178
// [D : [U' 3R U, 2L2]] // 10/188
// [2R' 3U 2R, U2] // 8/196
// [y' U' : [U' 3L U, 2R]] // 9/205
// [U' : [U', 2R 3D 2R']] // 9/214
// [3L2, U' 2L2 U] // 8/222

// // right obliques (9 algs)
// [4Uw : [U 2R U', 3R']] // 10/232
// [2U', 3R U 3R'] // 8/240
// [Uw : [3R, Uw 2R' Uw']] // 9/249
// [U : [3R2, U 2R U']] // 9/258
// [L' : [3L U' 3L', 2U]] // 10/268
// [U 2L' : [2L' U' 2L, 3U']] // 11/279
// [Lw U' : [2L', U' 3L2 U]] // 11/290
// [U2, 2R 3U' 2R'] // 8/298
// [U 2L U', 3L] // 8/306

// // corners minus 2twist (3 algs)
// [F : [D', R U R']] // 10/316
// [R : [U, R D' R']] // 9/325
// [U R' : [R' D R, U']] // 11/336

// // inner wings (11 algs)
// [L' : [D', 3L U2 3L']] // 10/346
// [z' : [U L' U', 3L']] // 8/354
// [3Lw' U : [U 3L U', L']] // 11/365
// [z' : [U' L' U, 3R]] // 8/373
// [D R D', 3R'] // 8/381
// [3Lw' : [3R, U' L U]] // 9/390
// [z D : [3R', U R U']] // 10/400
// [5Rw' : [U' 3R U, L']] // 9/409
// [3Rw : [U R U', 3R2]] // 10/419
// [D : [U' R2 U, 3R2]] // 10/429
// [Rw' : [3R', U' R U]] // 9/438

// // outer wings (12 algs)
// [U', 2R' D2 2R] // 8/446
// [U' Rw U : [R', U 2R2 U']] // 13/459
// [z Rw' U' : [R2, U' 2R2 U]] // 11/470
// [D : [2R, U' R U]] // 10/480
// [Rw : [U2, 2R D 2R']] // 10/490
// [U' R2 U, 2R2] // 8/498
// [z' 2R' : [U' L' U, 2R2]] // 9/507
// [x' U : [L', U 2R2 U']] // 9/516
// [D R : [2R, U R U']] // 11/527
// [z : [2R', U R U']] // 8/535
// [Rw D' : [U R U', 2R']] // 12/547
// [2R U : [R', U 2L' U']] // 11/558

// // 2twist
// D' R' D R U R' D' R D R' D' R U' R' D R // 16/574

// // 574 moves in 184.68 = 3.11 STPS
// `);
// // alg.invert();
// console.log(alg.expanded().toString());