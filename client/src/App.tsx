import { useState, useEffect } from "react";
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Card, 
  CardContent,
  Divider,
  Chip,
  ThemeProvider,
  createTheme,
  CssBaseline
} from "@mui/material";

// Create a Material UI theme with blue primary and purple secondary colors
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
});

// Define job status colors
function getStatusColor(status: string): "default" | "primary" | "secondary" | "success" | "error" | "warning" | "info" {
  switch (status) {
    case "pending": return "warning";
    case "processing": return "info";
    case "completed": return "success";
    case "failed": return "error";
    default: return "default";
  }
}

function App() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/api/jobs");
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await response.json();
        setJobs(data);
        setLoading(false);
      } catch (err: any) {
        setError(err);
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Job Dashboard
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            }
          >
            Failed to load jobs: {error.message}
          </Alert>
        ) : (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {jobs.length} jobs found
            </Typography>
            
            {jobs.map(job => (
              <Card key={job.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{job.id}</Typography>
                    <Chip 
                      label={job.status} 
                      color={getStatusColor(job.status)}
                      size="small" 
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Type: <strong>{job.type}</strong>
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Created: <strong>{new Date(job.created_at).toLocaleString()}</strong>
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" fontWeight="bold">
                    Arguments:
                  </Typography>
                  <Box component="pre" sx={{ 
                    bgcolor: 'background.paper', 
                    p: 1,
                    borderRadius: 1, 
                    overflow: 'auto',
                    fontSize: '0.75rem'
                  }}>
                    {JSON.stringify(job.args, null, 2)}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;