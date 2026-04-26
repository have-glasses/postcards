import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#081120'
      },
      boxShadow: {
        glow: '0 0 80px rgba(56, 189, 248, 0.18)'
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(circle at top, rgba(99,102,241,0.24), transparent 55%)'
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-14px) scale(1.03)' }
        },
        drift: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(20px, -18px, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' }
        }
      },
      animation: {
        floatSlow: 'floatSlow 10s ease-in-out infinite',
        drift: 'drift 16s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;
