const webpack = require('webpack');

module.exports = (config: any) => {
  config.set({
    frameworks: ['mocha', 'chai', 'webpack'],
    plugins: [
      'karma-chai',
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-mocha',
      'karma-webpack',
    ],
    files: [
      { pattern: 'src/tests/**/*.test.ts', watched: false }
    ],
    reporters: ['progress'],
    port: 9876, // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true, // Karma captures browsers, runs the tests and exits
    concurrency: Infinity,
    preprocessors: {
      'src/tests/**/*.test.ts': ['webpack']
    },
    webpack: {
      // karma watches the test entry points
      // Do NOT specify the entry option
      // webpack watches dependencies

      // webpack configuration
      resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js']
      },
      module: {
        rules: [
          // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
          { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
      },
      plugins: [
        new webpack.DefinePlugin({
          __DEBUG__: true,
        }),
      ],
    },
  })
}