import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  Grid,
  Container,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import Layout from "../components/Layout";
import { Job, JobStatus } from "../lib/types";

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

function JobCard({ job }: { job: Job }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Link href={`/jobs/${job.id}`}>
            <Typography variant="h6" fontWeight="bold" sx={{ cursor: 'pointer', color: 'primary.main' }}>
              {job.id.substring(0, 8)}...
            </Typography>
          </Link>
          <Chip 
            label={job.status} 
            color={getStatusColor(job.status)}
            size="small" 
          />
        </Box>
        
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Type: <Box component="span" fontWeight="medium">{job.type}</Box>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Created: <Box component="span" fontWeight="medium">{new Date(job.created_at).toLocaleString()}</Box>
          </Typography>
        </Stack>
        
        {job.error_message && (
          <Alert severity="error" sx={{ mb: 2, fontSize: "0.75rem" }}>
            {job.error_message}
          </Alert>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Arguments
        </Typography>
        <Box 
          component="pre" 
          sx={{ 
            bgcolor: 'grey.50', 
            p: 1.5,
            borderRadius: 1, 
            overflow: 'auto',
            fontSize: '0.75rem',
            border: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          {JSON.stringify(job.args, null, 2)}
        </Box>
      </CardContent>
    </Card>
  );
}

interface StatusCount {
  status: "all" | JobStatus;
  count: number;
  label: string;
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | JobStatus>("all");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/jobs");
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data = await response.json();
      setJobs(data);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Calculate counts for each status
  const statusCounts: StatusCount[] = [
    { status: "all", count: jobs.length, label: "All Jobs" },
    { status: "pending", count: jobs.filter(job => job.status === "pending").length, label: "Pending" },
    { status: "processing", count: jobs.filter(job => job.status === "processing").length, label: "Processing" },
    { status: "completed", count: jobs.filter(job => job.status === "completed").length, label: "Completed" },
    { status: "failed", count: jobs.filter(job => job.status === "failed").length, label: "Failed" },
  ];

  // Filter jobs based on active tab
  const filteredJobs = activeTab === "all" 
    ? jobs 
    : jobs.filter(job => job.status === activeTab);

  return (
    <Layout title="Job Dashboard" onRefresh={fetchJobs} isLoading={loading}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" color="text.secondary" paragraph>
          View and manage your forecast jobs from a single dashboard.
        </Typography>
      </Box>

      {/* Status Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          {statusCounts.map((item) => (
            <Tab 
              key={item.status} 
              value={item.status} 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span>{item.label}</span>
                  <Chip 
                    size="small" 
                    label={item.count} 
                    color={getStatusColor(item.status)}
                    sx={{ ml: 1, height: 20, minWidth: 20 }} 
                  />
                </Box>
              } 
            />
          ))}
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchJobs}
            >
              Retry
            </Button>
          }
        >
          Failed to load jobs: {error.message}
        </Alert>
      ) : (
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
            </Typography>
          </Box>
          
          {filteredJobs.length === 0 ? (
            <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No jobs found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeTab === "all" 
                    ? "Create new jobs to see them appear here." 
                    : `No ${activeTab} jobs found. Try a different filter.`}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Layout>
  );
}