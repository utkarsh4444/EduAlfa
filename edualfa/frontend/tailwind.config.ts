import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", 'sans-serif'],
        body: ["'Space Grotesk'", 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(124, 111, 255, 0.12)',
      },
      backgroundImage: {
        stars: 'radial-gradient(circle at 20% 20%, rgba(124,111,255,0.15,0.35), transparent 25%), radial-gradient(circle at 80% 40%, rgba(255,107,107,0.2), transparent 20%), radial-gradient(circle at 50% 80%, rgba(255,215,0,0.12), transparent 15%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
