module.exports = {
  mode: 'production',
  entry: ['./src/loader.js'],
  output: {
    filename: './bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: [/node_modules/, /upload.js/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  }
};
