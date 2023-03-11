function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    if (!shader) {
        return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`Shader compiler error: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
function compileProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
    if (vertexShader === null || fragmentShader === null) {
        console.error("Vertex or fragment shader null.");
        return null;
    }
    const shaderProgram = gl.createProgram();
    if (shaderProgram === null)
        return null;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error(`Shader program error: ${gl.getProgramInfoLog(shaderProgram)}`);
        return null;
    }
    return shaderProgram;
}
function loadTexture(gl, image) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    return texture;
}
function textImage(text, width, height, font) {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
        return null;
    }
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "white";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    return canvas;
}
export class BinaryBackground {
    constructor(gl) {
        this.program = null;
        this.vertexBuffer = null;
        this.vertexPositionLocation = null;
        this.zeroTexture = null;
        this.oneTexture = null;
        this.zeroTextureLocation = null;
        this.oneTextureLocation = null;
        this.instanceCountLocation = null;
        this.timeLocation = null;
        this.gl = gl;
        this.initShaders();
        this.initShaderAttributes();
        this.initBuffer();
        this.setBuffer();
        this.initTextures();
        this.initUniforms();
    }
    initShaders() {
        const vertexSource = `#version 300 es
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
        const fragmentSource = `#version 300 es
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
    initBuffer() {
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        const vertices = [
            -1.0, -1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    }
    initShaderAttributes() {
        if (this.program === null) {
            return;
        }
        this.vertexPositionLocation = this.gl.getAttribLocation(this.program, "vertexPosition");
    }
    setBuffer() {
        if (this.vertexPositionLocation === null) {
            return;
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(this.vertexPositionLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.vertexPositionLocation);
    }
    initTextures() {
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
    setTextures() {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.zeroTexture);
        this.gl.uniform1i(this.zeroTextureLocation, 0);
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.oneTexture);
        this.gl.uniform1i(this.oneTextureLocation, 1);
    }
    initUniforms() {
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
        this.gl.uniform2i(this.instanceCountLocation, xInstances, yInstances);
        this.gl.uniform1f(this.timeLocation, performance.now());
        this.gl.drawArraysInstanced(this.gl.TRIANGLE_STRIP, 0, 4, xInstances * yInstances);
    }
}
