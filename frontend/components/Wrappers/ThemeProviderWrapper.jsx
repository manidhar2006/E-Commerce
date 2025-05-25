// ThemeProviderWrapper.jsx
"use client"; // Mark this as a Client Component

import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "../Theme"; // Import the theme

export default function ThemeProviderWrapper({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalize CSS */}
      {children}
    </ThemeProvider>
  );
}