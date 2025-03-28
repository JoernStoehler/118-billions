module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/production/**/*.{html,json,png}",
    "./index.html" // Include the root index.html file
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#1a1a1a',
          800: '#2a2a2a',
          700: '#3a3a3a',
          300: '#d1d1d1',
          200: '#e1e1e1',
          100: '#f1f1f1',
        },
      },
    },
  },
  plugins: [],
}