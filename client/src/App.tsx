import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Dashboard from "./pages/Dashboard";
import JobDetailsPage from "./pages/job-details";
import NotFound from "./pages/not-found";
import Layout from "./components/Layout";

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
    background: {
      default: '#f8fafc',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/job/:id" component={JobDetailsPage} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;