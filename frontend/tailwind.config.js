/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F2F0E3',
        ink: '#1F2A22',
        forest: {
          DEFAULT: '#2F4B3C',
          light: '#3E6350',
          dark: '#1C2F26',
        },
        turmeric: {
          DEFAULT: '#DFA13B',
          light: '#F0C578',
          dark: '#B87F24',
        },
        clay: {
          DEFAULT: '#A64B34',
          light: '#C97654',
        },
        sage: {
          DEFAULT: '#7C9473',
          light: '#A9BCA1',
        },
        cardcream: '#FBFAF2',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Manrope', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        soft: '0 2px 20px -4px rgba(31, 42, 34, 0.12)',
        lift: '0 12px 30px -8px rgba(31, 42, 34, 0.25)',
      },
    },
  },
  plugins: [],
};
