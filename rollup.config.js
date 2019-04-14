import babel from 'rollup-plugin-babel'

export default {
  input: 'src/import-map-overrides.js',
  output: {
    file: 'dist/import-map-overrides.js',
    format: 'iife',
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
  ],
}