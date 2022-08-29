class Array2D {
    constructor(width, height, fillValue = 0) {
        if (typeof fillValue === "function") {
            this.array = new Array(width * height).fill(0).map(() => fillValue());
        } else {
            this.array = new Array(width * height).fill(fillValue);
        }
        this.width = width;
        this.height = height;
    }
    get(x, y) {
        return this.array[y * this.height + x];
    }
    set(x, y, val) {
        this.array[y * this.height + x] = val;
        return val;
    }
}

class BinaryBackground {
    constructor(ctx, canvasParent) {
        this.canvas = ctx.canvas;
        this.ctx = ctx;
        this.canvasParent = canvasParent;
        
        this.canvas.width = canvasParent.offsetWidth;
        this.canvas.height = canvasParent.offsetHeight;

        this.font = {
            family: "monospace",
            size: 20,
            color: "#444",
            toString: function() {
                return `${this.size}px ${this.family}`;
            }
        };

        this.spacingX = this.font.size;
        this.spacingY = this.font.size;

        this.offsetX = 0;
        this.offsetY = 0;

        this.repeatX = Math.ceil(this.canvas.width / this.spacingX);
        this.repeatY = Math.ceil(this.canvas.height / this.spacingY);

        this.bounds = {
            width: this.spacingX * this.repeatX,
            height: this.spacingY * this.repeatY
        };
        
        const rand01 = () => ~~(Math.random() * 2);
        this.binArray = new Array2D(this.repeatX, this.repeatY, rand01);
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = this.font.toString();
        this.ctx.fillStyle = this.font.color;
        for (let x = 0; x < this.repeatX; x++) {
            for (let y = 0; y < this.repeatY; y++) {
                let posX = (this.offsetX + x * this.spacingX) % this.bounds.width;
                let posY = (this.offsetY + y * this.spacingY) % this.bounds.height;
                this.ctx.fillText(this.binArray.get(x, y), posX, posY);
            }
        }
        this.offsetX = (this.offsetX + 1) % this.bounds.width;
        this.offsetY = (this.offsetY + 1) % this.bounds.height;
    }
}

const FRAME_RATE = 20;
const FRAME_TIME = 1000 / FRAME_RATE;

const backgroundCanvas = document.getElementById("background-canvas");
const bg = backgroundCanvas.getContext("2d");
const restOfPageDiv = document.getElementById("rest-of-page");
const binaryBackground = new BinaryBackground(bg, restOfPageDiv);

const interval = window.setInterval(binaryBackground.render.bind(binaryBackground), FRAME_TIME);

// function oldCode() {
//     const restOfPageDiv = document.getElementById("rest-of-page");
//     const backgroundCanvas = document.getElementById("background-canvas");
//     const bg = backgroundCanvas.getContext("2d");

//     let canvasWidth;
//     let canvasHeight;

//     let timeout;
//     let delay = 100;

//     const resizeCanvas = function(imlazy = true) {
//         backgroundCanvas.width = restOfPageDiv.offsetWidth;
//         backgroundCanvas.height = restOfPageDiv.offsetHeight;
//         canvasWidth = backgroundCanvas.width;
//         canvasHeight = backgroundCanvas.height;
//         if (imlazy) {
//             drawBits();
//         }
//     };
//     window.addEventListener("resize", () => {
//         window.clearTimeout(timeout);
//         timeout = window.setTimeout(resizeCanvas, delay);
//     });
//     resizeCanvas(false);

//     let fontSize = 20;
//     let textColor = "#555";

//     let spacingX = fontSize;
//     let spacingY = fontSize * 4 / 3;

//     const rand01 = function() {
//         return ~~(Math.random() * 2);
//     }

//     let numsHorizontal = Math.ceil(canvasWidth / spacingX);
//     let numsVertical = Math.ceil(canvasHeight / spacingY);
//     let numArr = [];

//     let offsetX = 0;
//     let offsetY = 0;
//     const drawBits = function() {
//         bg.clearRect(0, 0, canvasWidth, canvasHeight);
//         bg.font = `${fontSize}px Arial`;
//         bg.fillStyle = textColor;
//         bg.textAlign = "center";
//         bg.textBaseline = "middle";
//         for (let x = 0; x < canvasWidth; x += spacingX) {
//             for (let y = 0; y < canvasHeight; y += spacingY) {
//                 let index = (y / spacingY) * numsHorizontal + (x / spacingX);
//                 if (numArr[index] === undefined) numArr[index] = rand01();
//                 bg.fillText(numArr[index], wrapAround(offsetX + x, canvasWidth), wrapAround(offsetY + y, canvasHeight));
//             }
//         }
//     };
//     const wrapAround = function(val, max) {
//         return val % max;
//     };

//     drawBits();

//     let changesPerFrame = 50;

//     const loop = function() {
//         offsetX += 1;
//         offsetY += 1;
//         let randIndex;
//         for (let i = 0; i < changesPerFrame; i++) {
//             randIndex = Math.floor(Math.random() * numArr.length);
//             numArr[randIndex] = numArr[randIndex] === 1 ? 0 : 1;
//         }
//         drawBits();
//     }

//     let interval = 100;
//     window.setInterval(loop, interval);
// }