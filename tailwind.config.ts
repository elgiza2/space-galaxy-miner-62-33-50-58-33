
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
			colors: {
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
				// Gaming theme colors
				gold: {
					DEFAULT: 'hsl(var(--gold))',
					foreground: 'hsl(var(--gold-foreground))'
				},
				neon: {
					blue: 'hsl(var(--neon-blue))',
					purple: 'hsl(var(--neon-purple))',
					green: 'hsl(var(--neon-green))'
				},
				// Sugar Rush candy colors
				candy: {
					pink: 'hsl(var(--candy-pink))',
					purple: 'hsl(var(--candy-purple))',
					blue: 'hsl(var(--candy-blue))',
					green: 'hsl(var(--candy-green))',
					orange: 'hsl(var(--candy-orange))',
					red: 'hsl(var(--candy-red))',
					yellow: 'hsl(var(--candy-yellow))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-candy': 'var(--gradient-candy)',
				'gradient-sweet': 'var(--gradient-sweet)',
				'gradient-rainbow': 'var(--gradient-rainbow)',
				'cosmic-glow': 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.3) 0%, transparent 70%)',
				'neon-glow': 'radial-gradient(circle, hsl(var(--neon-blue) / 0.2) 0%, transparent 70%)',
				'candy-glow': 'radial-gradient(circle, hsl(var(--candy-pink) / 0.3) 0%, transparent 60%)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			transitionDuration: {
				'4000': '4000ms',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)' },
					'50%': { boxShadow: '0 0 40px rgba(236, 72, 153, 0.8)' }
				},
				'rotate-slow': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: 'var(--shadow-glow)' 
					},
					'50%': { 
						boxShadow: 'var(--shadow-neon)' 
					}
				},
				'neon-pulse': {
					'0%, 100%': { 
						filter: 'brightness(1) saturate(1)' 
					},
					'50%': { 
						filter: 'brightness(1.2) saturate(1.3)' 
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'rotate-slow': 'rotate-slow 10s linear infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'neon-pulse': 'neon-pulse 3s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
