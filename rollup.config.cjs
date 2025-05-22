const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("@rollup/plugin-typescript");
module.exports = {
    input: "src/server.ts",
    output: {
        file: "dist/css-lsp-server.js",
        format: "cjs",
        sourcemap: true,
    },
    plugins: [
        typescript({
            tsconfig: "./tsconfig.json",
            module: "esnext", // 强制使用 ESNext 模块格式
            sourceMap: true, // 启用 sourcemap
            inlineSources: false,
        }),
        nodeResolve({
            preferBuiltins: false,
        }),
        commonjs(),
    ],
};
