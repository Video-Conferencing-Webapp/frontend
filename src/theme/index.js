import { createTheme } from "@mui/material/styles";
import palette from "./palette";

const theme = (mode) =>
  createTheme({
    palette: palette[mode],
    shape: {
      borderRadius: 8,
    },
  });

export default theme; 