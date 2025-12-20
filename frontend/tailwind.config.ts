import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2ff',
          100: '#cce5ff',
          200: '#99cbff',
          300: '#66b1ff',
          400: '#3397ff',
          500: '#0082FB', // Main primary color
          600: '#0064E0', // Darker blue
          700: '#004db3',
          800: '#003686',
          900: '#001f59',
        },
        accent: {
          DEFAULT: '#A5CE00',
          50: '#f0f8e6',
          100: '#e1f1cd',
          200: '#c3e39b',
          300: '#a5d569',
          400: '#87c737',
          500: '#A5CE00',
          600: '#84a500',
          700: '#637c00',
          800: '#425300',
          900: '#212a00',
        },
        background: {
          DEFAULT: '#F1F5F8',
          light: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
};
export default config;

