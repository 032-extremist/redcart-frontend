/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#C40000",
          deep: "#7f0000",
          white: "#FFFFFF",
          mist: "#F4F4F5",
          smoke: "#E4E4E7",
          ink: "#111113"
        }
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"]
      },
      boxShadow: {
        card: "0 10px 30px rgba(196, 0, 0, 0.12)",
        soft: "0 8px 20px rgba(17, 17, 19, 0.08)"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        rise: "rise 450ms ease-out"
      }
    }
  },
  plugins: []
};
