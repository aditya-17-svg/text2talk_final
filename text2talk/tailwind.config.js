export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Palette: deep navy #111844, indigo #4B5694, steel #7288AE, beige #EAE0CF
        brand: {
          50: '#f3ecdf',
          100: '#d8ccb6',
          500: '#4b5694',
          600: '#3f4982',
          700: '#2c3567',
        },
        ink: '#111844',
        night: '#111844',
        steel: '#7288ae',
        cream: { 100: '#fbf8f2', 200: '#eae0cf' },
      },
    },
  },
};
