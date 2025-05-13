import { Switch, Route } from "wouter";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Dashboard from "@/pages/dashboard";
import JobDetailsPage from "@/pages/job-details";
import NotFound from "@/pages/not-found";

// Create a Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1e40af',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6b21a8',
      light: '#a855f7',
      dark: '#4c1d95',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/jobs/:id" component={JobDetailsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;