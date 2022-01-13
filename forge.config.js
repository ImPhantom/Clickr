const path = require('path');

module.exports = {
	packagerConfig: {
		name: 'clickr',
		executableName: 'clickr',
		icon: path.join(__dirname, '.webpack/main/icons/icon')
	},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {
				name: 'clickr'
			}
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: [
				'darwin'
			]
		},
		{
			name: '@electron-forge/maker-deb',
			config: {}
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {}
		}
	],
	plugins: [
		[
			'@electron-forge/plugin-webpack',
			{
				devContentSecurityPolicy: 'default-src \'self\' https://fonts.googleapis.com https://fonts.gstatic.com \'unsafe-eval\' \'unsafe-inline\';img-src * \'self\' data:;media-src \'self\' data:;',
				mainConfig: './webpack.main.config.js',
				renderer: {
					config: './webpack.renderer.config.js',
					entryPoints: [
						{
							html: './src/renderer/index.html',
							js: './src/renderer/renderer.js',
							name: 'main_window',
							preload: {
								js: './src/main/preload.js'
							}
						}
					]
				}
			}
		]
	]
};