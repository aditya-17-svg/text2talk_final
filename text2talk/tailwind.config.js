export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: { extend: {
    fontFamily: { sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'] },
    colors: {
      // Palette: navy #354d81, cream #faefe2, tan #b29d7e, sage #949f7b, white
      brand: { 50: '#faefe2', 100: '#e6d9c6', 500: '#354d81', 600: '#2d4170', 700: '#27345e' },
      ink: '#1c2644', night: '#27345e',
      tan: '#b29d7e', sage: '#949f7b',
      cream: { 100: '#ffffff', 200: '#faefe2' },
    },
  } },
}
