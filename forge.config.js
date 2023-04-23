const path = require('path');
const { version, name } = require('./package.json');

module.exports = {
	packagerConfig: {
		name: 'clickr',
		executableName: 'clickr',
		icon: path.join(__dirname, '.webpack/main/icons/icon'),
		win32metadata: {
			CompanyName: 'Clickr',
			ProductName: 'Clickr',
			FileDescription: 'A heavyweight but beautiful auto-clicker'
		}
	},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {
				name: 'clickr',
				setupExe: `${name}_${version}_win64.exe`,
				setupIcon: path.join(__dirname, '.webpack/main/icons/icon.ico'),
				iconUrl: path.join(__dirname, '.webpack/main/icons/icon.ico')
			}
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['darwin']
		},
		{
			name: '@electron-forge/maker-deb',
			platforms: ['linux'],
			config: {
				categories: ['Utility'],
				description: 'A heavyweight but beautiful auto-clicker',
				icon: path.join(__dirname, '.webpack/main/icons/icon.png'),
			}
		}
	],
	plugins: [
		{
			name: '@electron-forge/plugin-webpack',
			config: {
				devContentSecurityPolicy: 'default-src \'self\' https://fonts.googleapis.com https://fonts.gstatic.com \'unsafe-eval\' \'unsafe-inline\';img-src * \'self\' data:;media-src \'self\' data:;',
				mainConfig: './webpack.main.config.js',
				renderer: {
					config: './webpack.renderer.config.js',
					entryPoints: [
						{
							name: 'main_window',
							html: './src/renderer/core/index.html',
							js: './src/renderer/core/renderer.js',
							preload: {
								js: './src/main/preload.js'
							}
						},
						{
							name: 'settings_window',
							html: './src/renderer/settings/index.html',
							js: './src/renderer/settings/renderer.js',
							preload: {
								js: './src/main/preload.js'
							}
						}
					]
				}
			}
		}
	]
};