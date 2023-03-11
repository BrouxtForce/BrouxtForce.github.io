/*
    https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context used as reference
*/

function compileShader(gl: WebGL2RenderingContext, source: string, type: number): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) {
        return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Compile error handling
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`Shader compiler error: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
function compileProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram | null {
    const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

    if (vertexShader === null || fragmentShader === null) {
        console.error("Vertex or fragment shader null.");
        return null;
    }

    const shaderProgram = gl.createProgram();
    if (shaderProgram === null) return null;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error(`Shader program error: ${gl.getProgramInfoLog(shaderProgram)}`);
        return null;
    }

    return shaderProgram;
}
function loadTexture(gl: WebGL2RenderingContext, image: TexImageSource): WebGLTexture | null {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    return texture;
}
function textImage(text: string, width: number, height: number, font: string): OffscreenCanvas | null {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    if (ctx === null) {
        return null;
    }

    ctx.font = font;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Clear the canvas to black
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    // Render the text
    ctx.fillStyle = "white";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Return the canvas
    return canvas;
}

export class BinaryBackground {
    private gl: WebGL2RenderingContext;

    private program: WebGLProgram | null = null;
    private vertexBuffer: WebGLBuffer | null = null;
    private vertexPositionLocation: number | null = null;

    private zeroTexture: WebGLTexture | null = null;
    private oneTexture: WebGLTexture | null = null;

    private zeroTextureLocation: WebGLUniformLocation | null = null;
    private oneTextureLocation: WebGLUniformLocation | null = null;

    private instanceCountLocation: WebGLUniformLocation | null = null;
    private timeLocation: WebGLUniformLocation | null = null;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;

        this.initShaders();
        this.initShaderAttributes();
        this.initBuffer();
        this.setBuffer();
        this.initTextures();
        this.initUniforms();
    }

    private initShaders(): void {
        const vertexSource: string = `#version 300 es
            in vec4 vertexPosition;

            uniform ivec2 instanceCount;
            uniform float time;

            out vec2 texCoord;
            out float lerpAmt;

            void main() {
                vec2 instancePos = vec2(gl_InstanceID % instanceCount.x, gl_InstanceID / instanceCount.x);

                vec2 corner = 2.0 * (instancePos / vec2(instanceCount)) - 1.0;
                vec2 size = vec2(1.0 / float(instanceCount.x), 1.0 / float(instanceCount.y));
                vec2 pos = (vertexPosition.xy + vec2(1.0, 1.0));

                gl_Position = vec4(corner + size * pos, 0.0, 1.0);

                texCoord = (vertexPosition.xy + 1.0) / 2.0;
                texCoord.y = 1.0 - texCoord.y;

                lerpAmt = (time - time * floor(time / 1000.0)) / 1000.0;
            }
        `;
        const fragmentSource: string = `#version 300 es
            precision highp float;

            in vec2 texCoord;
            in float lerpAmt;

            out vec4 fragColor;

            uniform sampler2D texture0;
            uniform sampler2D texture1;

            vec4 lerp(vec4 a, vec4 b, float t) {
                return a + (b - a) * t;
            }

            void main() {
                fragColor = lerp(
                    texture(texture0, texCoord),
                    texture(texture1, texCoord),
                    lerpAmt
                );
                // fragColor = texture(texture1, texCoord);
            }
        `;
        this.program = compileProgram(this.gl, vertexSource, fragmentSource);
    }
    private initBuffer() {
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

        const vertices = [
            -1.0, -1.0,
            -1.0,  1.0,
             1.0, -1.0,
             1.0,  1.0
        ];

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    }
    private initShaderAttributes(): void {
        if (this.program === null) {
            return;
        }
        this.vertexPositionLocation = this.gl.getAttribLocation(this.program, "vertexPosition");
    }
    private setBuffer(): void {
        if (this.vertexPositionLocation === null) {
            return;
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.vertexPositionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.vertexPositionLocation);
    }
    private initTextures(): void {
        if (this.program === null) {
            return;
        }
        this.zeroTextureLocation = this.gl.getUniformLocation(this.program, "texture0");
        this.oneTextureLocation = this.gl.getUniformLocation(this.program, "texture1");

        const zeroCanvas = textImage("0", 50, 50, "40px Arial");
        const oneCanvas = textImage("1", 50, 50, "40px Arial");
        if (zeroCanvas === null || oneCanvas === null) {
            return;
        }

        this.zeroTexture = loadTexture(this.gl, zeroCanvas);
        this.oneTexture = loadTexture(this.gl, oneCanvas);
    }
    private setTextures(): void {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.zeroTexture);
        this.gl.uniform1i(this.zeroTextureLocation, 0);

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.oneTexture);
        this.gl.uniform1i(this.oneTextureLocation, 1);
    }
    private initUniforms(): void {
        if (this.program === null) {
            return;
        }
        this.instanceCountLocation = this.gl.getUniformLocation(this.program, "instanceCount");
        this.timeLocation = this.gl.getUniformLocation(this.program, "time");
    }

    render() {
        this.gl.clearColor(0, 0, 0, 1);

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);

        this.setBuffer();
        this.setTextures();

        let instanceWidth = 25;
        let instanceHeight = 25;

        let xInstances = Math.ceil(this.gl.canvas.width / instanceWidth);
        let yInstances = Math.ceil(this.gl.canvas.height / instanceHeight);

        // Set uniforms
        this.gl.uniform2i(this.instanceCountLocation, xInstances, yInstances);
        this.gl.uniform1f(this.timeLocation, performance.now());

        // this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.drawArraysInstanced(this.gl.TRIANGLE_STRIP, 0, 4, xInstances * yInstances);
    }
}