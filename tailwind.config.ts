
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'poppins': ['Poppins', 'sans-serif'],
				'inter': ['Inter', 'sans-serif'],
			},
			colors: {
				'key-green': '#68B483',
				'key-green-dark': '#0E3B2C',
				'dark-gray': '#1E1E1E',
				'medium-gray': '#4A4A4A',
				'light-gray': '#7A7A7A',
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'glow-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 8px 2px rgba(104, 180, 131, 0.4)'
					},
					'50%': {
						boxShadow: '0 0 12px 4px rgba(104, 180, 131, 0.6)'
					}
				},
				marquee: {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-50%)' }
				},
				'hero-slide-in-right': {
					'0%': { transform: 'translate3d(100%, 0, 0)' },
					'100%': { transform: 'translate3d(0, 0, 0)' }
				},
				'hero-slide-in-left': {
					'0%': { transform: 'translate3d(-100%, 0, 0)' },
					'100%': { transform: 'translate3d(0, 0, 0)' }
				},
				'hero-blur-out': {
					'0%': { filter: 'blur(0px)', opacity: '1' },
					'100%': { filter: 'blur(14px)', opacity: '0.55' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow-pulse': 'glow-pulse 3s infinite',
				marquee: 'marquee 40s linear infinite',
				'hero-slide-in-right': 'hero-slide-in-right 1100ms cubic-bezier(0.33, 1, 0.32, 1) forwards',
				'hero-slide-in-left': 'hero-slide-in-left 1100ms cubic-bezier(0.33, 1, 0.32, 1) forwards',
				'hero-blur-out': 'hero-blur-out 1100ms cubic-bezier(0.33, 1, 0.32, 1) forwards'
			},
			backgroundImage: {
				'radial-gradient': 'radial-gradient(circle, #4A4A4A, #1E1E1E)',
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
