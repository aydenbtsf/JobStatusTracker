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
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TableSortLabel,
} from "@mui/material";
import { 
  CheckCircle, 
  Clock, 
  Loader,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";
import Layout from "../components/Layout";
import Sidebar from "../components/Sidebar";
import { Job } from "../lib/types";

// Define job status styles
function getStatusIcon(status: string) {
  switch (status) {
    case "pending": return <Clock size={16} color="#f59e0b" />;
    case "processing": return <Loader size={16} color="#3b82f6" />;
    case "completed": return <CheckCircle size={16} color="#10b981" />;
    case "failed": return <AlertCircle size={16} color="#ef4444" />;
    default: return null;
  }
}

function getStatusChipColor(status: string): string {
  switch (status) {
    case "pending": return "#fffbeb"; // Light yellow background
    case "processing": return "#eff6ff"; // Light blue background
    case "completed": return "#ecfdf5"; // Light green background
    case "failed": return "#fef2f2"; // Light red background
    default: return "#f9fafb"; // Light gray default
  }
}

function getStatusChipTextColor(status: string): string {
  switch (status) {
    case "pending": return "#d97706"; // Dark yellow text
    case "processing": return "#2563eb"; // Dark blue text
    case "completed": return "#059669"; // Dark green text
    case "failed": return "#dc2626"; // Dark red text
    default: return "#6b7280"; // Dark gray default
  }
}

function getRowBackground(status: string): string {
  switch (status) {
    case "completed": return "#f0fdf4"; // Very light green
    case "processing": return "#f0f9ff"; // Very light blue
    default: return "transparent";
  }
}

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
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

  // Get the job type display name
  const getJobTypeName = (type: string): string => {
    switch (type) {
      case "weatherForecast": return "Weather";
      case "waveForecast": return "Wave";
      case "tideForecast": return "Tide";
      case "fetchTerrain": return "Terrain";
      default: return type;
    }
  };

  // Format job ID to match screenshot (job-001, job-002)
  const formatJobId = (id: string): string => {
    return `job-${id.substring(0, 3)}`;
  };

  return (
    <Layout title="Jobs" onRefresh={fetchJobs} isLoading={loading}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          View and manage forecast jobs
        </Typography>
      </Box>
      
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
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, boxShadow: 'none', width: '100%', overflowX: 'auto' }}>
          <Table size="medium">
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'id'}
                    direction={orderBy === 'id' ? order : 'asc'}
                    onClick={() => handleSort('id')}
                    sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'type'}
                    direction={orderBy === 'type' ? order : 'asc'}
                    onClick={() => handleSort('type')}
                    sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}
                  >
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleSort('status')}
                    sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'created_at'}
                    direction={orderBy === 'created_at' ? order : 'asc'}
                    onClick={() => handleSort('created_at')}
                    sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}
                  >
                    Created
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'updated_at'}
                    direction={orderBy === 'updated_at' ? order : 'asc'}
                    onClick={() => handleSort('updated_at')}
                    sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.875rem' }}
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
                      bgcolor: getRowBackground(job.status),
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: 'rgba(0, 0, 0, 0.08)'
                    }}
                    onClick={() => window.location.href = `/jobs/${job.id}`}
                  >
                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5 }}>
                      {getStatusIcon(job.status)}
                      <span>{formatJobId(job.id)}</span>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      {getJobTypeName(job.type)}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        size="small"
                        sx={{ 
                          height: '24px',
                          fontWeight: 500,
                          borderRadius: '4px',
                          backgroundColor: getStatusChipColor(job.status),
                          color: getStatusChipTextColor(job.status),
                          border: 'none'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5, color: 'text.secondary', fontSize: '0.875rem' }}>
                      {formatDate(job.created_at)}
                    </TableCell>
                    <TableCell sx={{ py: 1.5, color: 'text.secondary', fontSize: '0.875rem' }}>
                      {formatDate(job.updated_at)}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.5 }}>
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
    </Layout>
  );
}