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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TableSortLabel,
  ButtonGroup,
} from "@mui/material";
import { 
  CheckCircle, 
  Clock, 
  Loader,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";
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

function getStatusIcon(status: string) {
  switch (status) {
    case "pending": return <Clock size={16} color="#f59e0b" />;
    case "processing": return <Loader size={16} color="#3b82f6" />;
    case "completed": return <CheckCircle size={16} color="#10b981" />;
    case "failed": return <AlertCircle size={16} color="#ef4444" />;
    default: return null;
  }
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
  const [activeTab, setActiveTab] = useState<string>("Jobs");

  // Set sort state
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof Job>('created_at');

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

  const handleSort = (property: keyof Job) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort jobs based on current sort settings
  const sortedJobs = [...jobs].sort((a, b) => {
    if (orderBy === 'created_at' || orderBy === 'updated_at') {
      const dateA = new Date(a[orderBy]).getTime();
      const dateB = new Date(b[orderBy]).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    // For other string fields
    const aValue = a[orderBy] as string;
    const bValue = b[orderBy] as string;
    return order === 'asc' 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  // Format the date to match the screenshot (May 12, 11:10 AM)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getRowStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "#ecfdf5"; // Very light green
      case "processing": return "#eff6ff"; // Very light blue
      case "pending": return "#fffbeb"; // Very light amber
      case "failed": return "#fef2f2"; // Very light red
      default: return "transparent";
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <ButtonGroup variant="text" sx={{ p: 1 }}>
          <Button 
            onClick={() => setActiveTab("New Forecast")} 
            variant={activeTab === "New Forecast" ? "contained" : "text"}
          >
            New Forecast
          </Button>
          <Button 
            onClick={() => setActiveTab("Jobs")} 
            variant={activeTab === "Jobs" ? "contained" : "text"}
          >
            Jobs
          </Button>
          <Button 
            onClick={() => setActiveTab("Forecast Results")} 
            variant={activeTab === "Forecast Results" ? "contained" : "text"}
          >
            Forecast Results
          </Button>
        </ButtonGroup>
      </Box>
      
      <Box sx={{ display: 'flex', flex: 1, p: 2, gap: 2 }}>
        {/* Left panel - Job list */}
        <Card sx={{ flex: 2, overflow: 'auto' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" component="div" sx={{ mb: 0.5, fontWeight: 'bold' }}>
              Jobs
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              View and manage forecast jobs
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
                    onClick={fetchJobs}
                  >
                    Retry
                  </Button>
                }
              >
                Failed to load jobs: {error.message}
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                <Table size="medium">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'id'}
                          direction={orderBy === 'id' ? order : 'asc'}
                          onClick={() => handleSort('id')}
                        >
                          ID
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'type'}
                          direction={orderBy === 'type' ? order : 'asc'}
                          onClick={() => handleSort('type')}
                        >
                          Type
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'status'}
                          direction={orderBy === 'status' ? order : 'asc'}
                          onClick={() => handleSort('status')}
                        >
                          Status
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'created_at'}
                          direction={orderBy === 'created_at' ? order : 'asc'}
                          onClick={() => handleSort('created_at')}
                        >
                          Created
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'updated_at'}
                          direction={orderBy === 'updated_at' ? order : 'asc'}
                          onClick={() => handleSort('updated_at')}
                        >
                          Updated
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedJobs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                            No jobs found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedJobs.map((job) => (
                        <TableRow 
                          key={job.id}
                          sx={{ 
                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                            bgcolor: getRowStatusColor(job.status),
                            cursor: 'pointer'
                          }}
                          onClick={() => window.location.href = `/jobs/${job.id}`}
                        >
                          <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(job.status)}
                            <span>{`job-${job.id.substring(0, 3)}`}</span>
                          </TableCell>
                          <TableCell>
                            {job.type === 'weatherForecast' ? 'Weather' : 
                              job.type === 'waveForecast' ? 'Wave' : 
                              job.type === 'tideForecast' ? 'Tide' : 
                              job.type === 'fetchTerrain' ? 'Terrain' : job.type}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              size="small"
                              color={getStatusColor(job.status)}
                              variant="filled"
                              sx={{ 
                                height: '24px',
                                borderRadius: '12px',
                                fontWeight: 500,
                                minWidth: '90px',
                                textAlign: 'center',
                              }}
                            />
                          </TableCell>
                          <TableCell>{formatDate(job.created_at)}</TableCell>
                          <TableCell>{formatDate(job.updated_at)}</TableCell>
                          <TableCell align="center">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Show menu/actions for the job
                              }}
                            >
                              <MoreHorizontal size={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
        
        {/* Right panel - Job details */}
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body1" color="text.secondary">
              Select a job to view details
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}