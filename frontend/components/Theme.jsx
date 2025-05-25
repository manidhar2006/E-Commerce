// theme.jsx
"use client"; // Mark this as a Client Component

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light", // or 'dark'
    primary: {
      main: "#1976d2", // Customize your primary color
    },
    secondary: {
      main: "#dc004e", // Customize your secondary color
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif", // Customize your font
  },
});

export default theme;