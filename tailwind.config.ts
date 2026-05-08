import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: "#B5A5A9",
        basalt: "#232528",
        lavender: "#BFA7E8",
        persimmon: "#FF7E5F",
      },
    },
  },
  plugins: [],
};
export default config;