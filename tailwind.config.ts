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
        background: "var(--background)",
        foreground: "var(--foreground)",
        sigma: {
          bg: '#0a0f0d',
          surface: '#111a16',
          'surface-hover': '#162119',
          border: '#1e3a2f',
          'border-bright': '#2d5a47',
          green: '#00d4aa',
          'green-dim': '#00a888',
          'green-glow': '#00d4aa33',
          red: '#ff4757',
          'red-dim': '#cc3945',
          amber: '#ffa502',
          text: '#e8f0ec',
          'text-dim': '#7a9b8c',
          'text-muted': '#4a6b5c',
        },
      },
      backgroundImage: {
        'sigma-gradient': 'linear-gradient(135deg, #0a0f0d 0%, #0d1a14 50%, #0a0f0d 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(0,212,170,0.05) 0%, rgba(0,212,170,0.02) 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0,212,170,0.15)',
        'glow-strong': '0 0 40px rgba(0,212,170,0.25)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
