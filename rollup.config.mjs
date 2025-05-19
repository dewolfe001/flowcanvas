// rollup.config.mjs
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/flowcanvas.js',
      format: 'umd',
      name: 'FlowCanvas'
    },
    {
      file: 'dist/flowcanvas.min.js',
      format: 'umd',
      name: 'FlowCanvas',
      plugins: [terser()]
    }
  ]
};