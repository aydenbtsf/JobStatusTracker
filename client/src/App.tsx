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
        console.log("Fetching jobs...");
        const response = await fetch("/api/jobs");
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        
        const data = await response.json();
        console.log("Jobs data received:", data.length);
        setJobs(data);
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching jobs:", err);
        setError(err);
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  console.log("Rendering app, loading:", loading, "error:", error, "jobs:", jobs.length);
  
  return (
    <div style={{padding: '20px'}}>
      <h1>Job Dashboard</h1>
      {loading ? (
        <div style={{textAlign: 'center', padding: '40px'}}>
          <p>Loading...</p>
        </div>
      ) : error ? (
        <div style={{color: 'red', padding: '20px', border: '1px solid red'}}>
          <p>Error: {error.message}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : (
        <div>
          <p>{jobs.length} jobs found</p>
          {jobs.map(job => (
            <div key={job.id} className="job-card">
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h3>{job.id}</h3>
                <span className={`status-badge status-${job.status}`}>
                  {job.status}
                </span>
              </div>
              <p>Type: <strong>{job.type}</strong></p>
              <p>Created: <strong>{new Date(job.created_at).toLocaleString()}</strong></p>
              <hr />
              <p><strong>Arguments:</strong></p>
              <pre>
                {JSON.stringify(job.args, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;