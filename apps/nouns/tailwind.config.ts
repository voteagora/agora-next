import forms from "@tailwindcss/forms"
import typography from "@tailwindcss/typography"
import { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,jsx}",
    "./pages/**/*.{ts,tsx,jsx}",
    "./components/**/*.{ts,tsx,jsx}",
    "./**/*.{css,scss}",
    "./lib/**/*.{ts,tsx,jsx}",
    "./utils/**/*.ts"
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))"
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      },
      typography: (theme: (variable: string) => string) => ({
        DEFAULT: {
          css: {
            color: theme("colors.black"),
            a: {
              textDecorationColor: theme("colors.blue.600"),
              textDecorationThickness: "1.5px",
              textUnderlineOffset: "1px"
            },
            h1: {
              color: theme("colors.black"),
              fontWeight: "900"
            },
            h2: {
              color: theme("colors.black"),
              fontWeight: "900"
            },
            h3: {
              color: theme("colors.black"),
              fontSize: "1.12em"
            },
            blockquote: {
              borderLeftColor: theme("colors.blue.600")
            },
            "blockquote p:first-of-type::before": false,
            "blockquote p:last-of-type::after": false,
            strong: {
              fontWeight: "900"
            },
            img: {
              borderRadius: "0.75rem"
            }
          }
        }
      })
    }
  },
  plugins: [forms, typography]
}

export default config
