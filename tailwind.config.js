/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(101, 163, 255, 0.25), 0 0 40px rgba(34, 211, 238, 0.18), 0 0 70px rgba(99, 102, 241, 0.15)',
      },
      backgroundImage: {
        'neon-mesh':
          'radial-gradient(70% 80% at 10% 10%, rgba(56, 189, 248, 0.2), transparent 50%), radial-gradient(65% 70% at 90% 20%, rgba(129, 140, 248, 0.2), transparent 50%), radial-gradient(75% 80% at 50% 100%, rgba(6, 182, 212, 0.18), transparent 55%)',
      },
    },
  },
  plugins: [],
}