/ /** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./scripts/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        // Green neon Material You expressive palette (matches inline Tailwind config)
        neonBlue: "#22c55e", // primary neon green
        neonPurple: "#16a34a", // deeper green accent
        neonPink: "#4ade80", // soft lime/green
        neonCyan: "#a3e635", // yellow-green highlight
        deepSpace: "#050816",
      },
      boxShadow: {
        "neon-soft": "0 0 40px rgba(34,197,94,0.35)",
        "neon-strong": "0 0 80px rgba(34,197,94,0.75)",
      },
      backdropBlur: {
        glass: "20px",
      },
    },
  },
  plugins: [],
};
