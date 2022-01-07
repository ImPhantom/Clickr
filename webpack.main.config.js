const rules = require('./webpack.rules');

rules.push({
	test: /\.mp3$/i,
	loader: 'file-loader',
	options: {
		name: '[name].[ext]'
	},
});

module.exports = {
	/**
	 * This is the main entry point for your application, it's the first file
	 * that runs in the main process.
	 */
	entry: './src/main/main.js',
	// Put your normal webpack config below here
	module: {
		rules: rules,
	},
	resolve: {
		extensions: ['.js', '.jsx', '.css', '.scss', '.sass', '.json'],
	},
};
