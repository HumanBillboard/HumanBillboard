// index.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    background: {
      default: "#fff",
    },
  },
  typography: {
    fontFamily: `'Geist', 'sans-serif'`,
  },
});

export default theme;
