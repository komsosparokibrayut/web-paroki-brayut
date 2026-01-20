import type { Config } from "tailwindcss";

export default {
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  			colors: {
  				background: 'var(--background)',
  				foreground: 'var(--foreground)',
                brand: {
                    dark: '#0f172a', // Slate 900
                    blue: '#1e3a8a', // Blue 900
                    gold: '#b45309', // Amber 700
                    warm: '#FBF8F4', // Warm Off-White
                },
  				card: {
  					DEFAULT: 'var(--card)',
  					foreground: 'var(--card-foreground)'
  				},
  				popover: {
  					DEFAULT: 'var(--popover)',
  					foreground: 'var(--popover-foreground)'
  				},
  				primary: {
  					DEFAULT: 'var(--primary)',
  					foreground: 'var(--primary-foreground)'
  				},
  				secondary: {
  					DEFAULT: 'var(--secondary)',
  					foreground: 'var(--secondary-foreground)'
  				},
  				muted: {
  					DEFAULT: 'var(--muted)',
  					foreground: 'var(--muted-foreground)'
  				},
  				accent: {
  					DEFAULT: 'var(--accent)',
  					foreground: 'var(--accent-foreground)'
  				},
  				destructive: {
  					DEFAULT: 'var(--destructive)',
  					foreground: 'var(--destructive-foreground)'
  				},
  				border: 'var(--border)',
  				input: 'var(--input)',
  				ring: 'var(--ring)',
  				chart: {
  					'1': 'var(--chart-1)',
  					'2': 'var(--chart-2)',
  					'3': 'var(--chart-3)',
  					'4': 'var(--chart-4)',
  					'5': 'var(--chart-5)'
  				}
  			},
  		fontFamily: {
  			rubik: [
  				'var(--font-rubik)'
  			],
            serif: [
                'var(--font-libre)',
                'serif'
            ]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
        animation: {
            "accordion-down": "accordion-down 0.2s ease-out",
            "accordion-up": "accordion-up 0.2s ease-out",
        },
        keyframes: {
            "accordion-down": {
                from: { height: "0" },
                to: { height: "var(--radix-accordion-content-height)" },
            },
            "accordion-up": {
                from: { height: "var(--radix-accordion-content-height)" },
                to: { height: "0" },
            },
        },
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
