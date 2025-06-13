import ThemeProvider from "./theme/ThemeProvider";
import Router from "./routes/index.jsx";
import { SnackbarProvider } from "notistack";

function App() {
  return (
    <ThemeProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Router />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
