import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
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
  Breadcrumbs,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader,
  Link as LinkIcon,
} from "lucide-react";
import Layout from "../components/Layout";
import { Job, JobWithTriggers } from "../lib/types";

function getStatusColor(status: string): "default" | "primary" | "secondary" | "success" | "error" | "warning" | "info" {
  switch (status) {
    case "pending": return "warning";
    case "processing": return "info";
    case "completed": return "success";
    case "failed": return "error";
    default: return "default";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "pending": return <Clock size={16} />;
    case "processing": return <Loader size={16} />;
    case "completed": return <CheckCircle size={16} />;
    case "failed": return <AlertCircle size={16} />;
    default: return null;
  }
}

export default function JobDetails() {
  const [, params] = useRoute("/jobs/:id");
  const jobId = params?.id;
  const [job, setJob] = useState<JobWithTriggers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const fetchJob = async () => {
    try {
      setLoading(true);
      if (!jobId) {
        throw new Error("Job ID is missing");
      }

      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch job: ${response.statusText}`);
      }
      
      const data = await response.json();
      setJob(data);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching job:", err);
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  if (!jobId) {
    return (
      <Layout title="Job Not Found">
        <Alert severity="error">
          Job ID is missing. Please return to the dashboard.
        </Alert>
        <Button
          component={Link}
          href="/"
          startIcon={<ArrowLeft size={16} />}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Layout>
    );
  }

  return (
    <Layout title={`Job Details: ${jobId.substring(0, 8)}...`} onRefresh={fetchJob} isLoading={loading}>
      <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href="/">
          <Typography color="inherit" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            Dashboard
          </Typography>
        </Link>
        <Typography color="text.primary">Job Details</Typography>
      </Breadcrumbs>

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
              onClick={fetchJob}
            >
              Retry
            </Button>
          }
        >
          {error.message}
        </Alert>
      ) : job ? (
        <Box>
          {/* Job Overview Card */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                  Job: {job.id.substring(0, 12)}...
                </Typography>
                <Chip 
                  icon={getStatusIcon(job.status)}
                  label={job.status} 
                  color={getStatusColor(job.status)}
                />
              </Box>
              
              <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {job.type}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {new Date(job.created_at).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Updated
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {new Date(job.updated_at).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Triggers
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {job.triggers.length}
                  </Typography>
                </Grid>
              </Grid>
              
              {job.error_message && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {job.error_message}
                </Alert>
              )}
            </CardContent>
          </Card>
          
          {/* Tabs for different sections */}
          <Paper sx={{ mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Arguments" />
              <Tab label="Result Data" />
              {job.triggers.length > 0 && <Tab label="Trigger Jobs" />}
            </Tabs>
          </Paper>
          
          {/* Tab Content */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            {/* Arguments Tab */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Job Arguments
                </Typography>
                <Box 
                  component="pre" 
                  sx={{ 
                    bgcolor: 'grey.50', 
                    p: 2,
                    borderRadius: 1, 
                    overflow: 'auto',
                    fontSize: '0.875rem',
                    border: '1px solid',
                    borderColor: 'grey.200',
                    minHeight: '200px'
                  }}
                >
                  {JSON.stringify(job.args, null, 2)}
                </Box>
              </Box>
            )}
            
            {/* Result Data Tab */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  {job.type === 'waveForecast' ? 'Wave Forecast Data' : 'No Result Data Available'}
                </Typography>
                
                {job.type === 'waveForecast' && job.wave_forecast_data ? (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Location: {job.wave_forecast_data.location || 'Not specified'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Unit: {job.wave_forecast_data.unit || 'Not specified'}
                      </Typography>
                    </Box>
                    
                    <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Time</TableCell>
                            <TableCell>Height</TableCell>
                            <TableCell>Direction</TableCell>
                            <TableCell>Period</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {job.wave_forecast_data.data.map((entry, index) => (
                            <TableRow key={index}>
                              <TableCell>{entry.time}</TableCell>
                              <TableCell>{entry.height}</TableCell>
                              <TableCell>{entry.direction}</TableCell>
                              <TableCell>{entry.period}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ) : (
                  <Alert severity="info">
                    No result data available for this job type or the job hasn't completed yet.
                  </Alert>
                )}
              </Box>
            )}
            
            {/* Triggers Tab */}
            {activeTab === 2 && job.triggers.length > 0 && (
              <Box>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Triggered Jobs
                </Typography>
                <Stack spacing={2}>
                  {job.triggers.map((trigger) => (
                    <Card key={trigger.id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinkIcon size={16} style={{ marginRight: 8 }} />
                            <Link href={`/jobs/${trigger.id}`}>
                              <Typography variant="body1" fontWeight="medium" sx={{ cursor: 'pointer', color: 'primary.main' }}>
                                {trigger.id.substring(0, 8)}...
                              </Typography>
                            </Link>
                          </Box>
                          <Chip 
                            size="small"
                            label={trigger.status} 
                            color={getStatusColor(trigger.status)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Type: {trigger.type} | Created: {new Date(trigger.created_at).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        <Alert severity="error">
          Job not found. The requested job may have been deleted.
        </Alert>
      )}
    </Layout>
  );
}