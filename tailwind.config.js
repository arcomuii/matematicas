/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				regular: ["Regular", "sans-serif"], 
				bold: ["Bold", "sans-serif"], 
				semibold: ["DemiBold", "sans-serif"], 
			},
			colors: {
				Blanco: "#EAE8D7", 
				Verde: "#1E3F39",
			},
		},
	},
	plugins: [],
}