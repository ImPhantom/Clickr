const rules = require('./webpack.rules');

rules.push({
  test: /\.s[ac]ss$/i,
  use: [
    { loader: 'style-loader' }, // creates style nodes
    { loader: 'css-loader' }, // translates css into commonjs
    { loader: 'sass-loader' }, // compiles sass/scss
  ],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
};
