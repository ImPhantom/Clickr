module.exports = {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js}',
	],
	theme: {
		extend: {
			colors: {
				gray: {
					150: '#EBECEE', /*rgba(235, 236, 238, 1)*/
					250: '#D8DADE', /*rgba(216, 218, 222, 1)*/
					350: '#BABEC4', /*rgba(186, 190, 196, 1)*/
					450: '#808793', /*rgba(128, 135, 147, 1)*/
					550: '#5C6371', /*rgba(92, 99, 113, 1)*/
					650: '#414B59', /*rgba(65, 75, 89, 1)*/
					750: '#2A3444', /*rgba(42, 52, 68, 1)*/
					850: '#17212F', /*rgba(23, 33, 47, 1)*/
				},
			}
		},
	},

	plugins: [
		require('@tailwindcss/forms'),
	],
};