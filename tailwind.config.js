const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#ffb902',
        text: '#7f878c',
        accent: '#000f1a',
        alt: '#04877f',
        body: '#d1d5db',
        'dark-container': '#1a2035',
        'dark-white': '#0f172a',
        'dark-body': '#1e293b',
        'dark-text': '#9eacbf',
        warn: '#eab308',
        'color-popup': 'rgba(0,0,0,.32)',
        'dark-popup': 'rgba(15,23,42,1)',
        opacity: 'rgba(0,0,0,0.7)',
      },
      fontFamily: {
        nunito: ['Nunito Sans', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        outer: '0 2px 8px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        '.no-scrollbar': {
          scrollbarWidth: 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        '.transition-3s': {
          transition: 'color 0.3s ease',
        },
        '.floating': {
          transition: '200ms ease-in-out top, 200ms ease-in-out font-size, 200ms ease-in-out color',
        },
      });
    }),
  ],
};
