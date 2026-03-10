/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./website/**/*.html",
    "./docs/**/*.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 主色调 - 龙虾红
        primary: {
          DEFAULT: '#FF6B6B',
          dark: '#EE5A5A',
          light: '#FF8585',
        },
        // 辅助色
        secondary: '#4ECDC4',
        accent: '#FFE66D',
        purple: '#A78BFA',
        blue: '#60A5FA',
        // 热门标识
        hot: '#FF4757',
        fire: '#FF6348',
        // 暗黑模式背景
        dark: {
          primary: '#0F172A',
          secondary: '#1E293B',
          tertiary: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'lobster-wave': 'lobsterWave 2s ease-in-out infinite',
        'lobster-walk': 'lobsterWalk 0.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        lobsterWave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-10deg)' },
          '75%': { transform: 'rotate(10deg)' },
        },
        lobsterWalk: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
