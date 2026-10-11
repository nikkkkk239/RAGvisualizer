/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Source Sans 3",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        serif: ["Source Serif 4", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      colors: {
        paper: "#F4F1E9",
        surface: "#FBFAF6",
        ink: "#20231F",
        forest: "#355E4B",
        sage: "#DCE5D8",
        rust: "#B85C38",
        muted: "#858A84",
      },
      boxShadow: {
        panel: "none",
        sm: "none",
      },
    },
  },
  plugins: [],
};
