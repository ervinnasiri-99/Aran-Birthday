/ /** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./scripts/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        neonBlue: "#4fd1ff",
        neonPurple: "#a855f7",
        neonPink: "#fb37ff",
        neonCyan: "#22d3ee",
        deepSpace: "#050816",
      },
      boxShadow: {
        "neon-soft": "0 0 40px rgba(79,209,255,0.35)",
        "neon-strong": "0 0 80px rgba(168,85,247,0.7)",
      },
      backdropBlur: {
        glass: "20px",
      },
    },
  },
  plugins: [],
};
