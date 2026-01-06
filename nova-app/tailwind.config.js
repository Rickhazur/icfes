/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Poppins"', '"Comic Neue"', '"Nunito"', 'Outfit', 'sans-serif'],
        display: ['"Fredoka"', '"Comic Neue"', 'cursive'],
        poppins: ['"Poppins"', 'sans-serif'],
      },
      colors: {
        'kid-blue': '#4CC9F0',
        'kid-purple': '#7209B7',
        'kid-pink': '#F72585',
        'kid-yellow': '#FFD60A',
        'kid-orange': '#FF9F1C',
        'kid-green': '#06D6A0',
        'kid-navy': '#3A0CA3',
        'cream': '#FFFDF5',
        'comic-border': '#222222',
        // Elite Theme Colors
        'elite-blue': '#4361EE',
        'elite-indigo': '#3A0CA3',
        'elite-purple': '#7209B7',
        'elite-pink': '#F72585',
        'elite-orange': '#FB8500',
        'elite-cyan': '#4CC9F0',
        'elite-dark': '#1A1A1A',
      },
      backgroundImage: {
        'gradient-elite': 'linear-gradient(135deg, #4361EE 0%, #7209B7 100%)',
        'gradient-orange': 'linear-gradient(135deg, #FF9F1C 0%, #FF5400 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #4CC9F0 0%, #4361EE 100%)',
        'gradient-text': 'linear-gradient(to right, #4361EE, #4CC9F0)',
        'hero-glow': 'radial-gradient(circle at 50% 50%, rgba(67, 97, 238, 0.15) 0%, rgba(255, 255, 255, 0) 70%)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        'blob': '40% 60% 70% 30% / 40% 50% 60% 50%',
      },
      boxShadow: {
        'comic': '4px 4px 0px 0px #000000',
        'comic-lg': '8px 8px 0px 0px #000000',
        'comic-hover': '2px 2px 0px 0px #000000',
      },
      animation: {
        blob: "blob 10s infinite",
        'float': 'float 6s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        blob: "blob 10s infinite",
        'float': 'float 6s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'float 3s ease-in-out infinite', // Reusing float for gentle bounce
      },
    },
  },
  plugins: [],
}
