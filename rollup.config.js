import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import path from 'path';
const config = require('./bravery.config.js');

const SRC_DIR = config.dir.src;
const ASSETS_DIR = config.dir.assets;
const DIST_DIR = config.dir.dist;

const JS_SRC = path.join(ASSETS_DIR, 'js');
const JS_DIST = path.join(DIST_DIR, 'assets/js');

export default {
    input: path.join(JS_SRC, 'bravery.js'),
    output: {
        file: path.join(JS_DIST, 'bravery.bundle.js'),
        format: 'iife'
    },
    plugins: [
        resolve(),
		commonjs(),
		terser()
    ]
}