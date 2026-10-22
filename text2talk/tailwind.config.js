export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: { extend: {
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { 50: '#f4f1ff', 100: '#ebe5ff', 500: '#6c4fe0', 600: '#5b3fd0', 700: '#4a31b0' },
        ink: '#27205c', night: '#2a2160',
      },
    } },
}
