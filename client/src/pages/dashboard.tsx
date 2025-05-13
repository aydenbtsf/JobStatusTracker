import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { JobWithTriggers, JobFilters, Pipeline } from "@/lib/types";
import { JobStatus, JobType } from "@shared/schema";
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
  Tooltip,
  Divider
} from "@mui/material";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Plus,
  GitBranch,
  Activity
} from "lucide-react";
import { SimplePipelineModal } from "@/components/simple-pipeline-modal";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const [pipelineModalOpen, setPipelineModalOpen] = useState(false);
  
  // Debug log for component mount
  useEffect(() => {
    console.log("Dashboard component mounted");
  }, []);
  
  // Parse query parameters
  const params = new URLSearchParams(location.split('?')[1] || '');
  const filterStatus = params.get('status') as JobStatus | null;
  
  const [filters, setFilters] = useState<JobFilters>({
    type: "",
    status: filterStatus || "",
    dateFrom: "",
    dateTo: "",
  });
  
  // Update URL when filters change
  useEffect(() => {
    if (filters.status) {
      setLocation(`/?status=${filters.status}`);
    } else {
      setLocation('/');
    }
  }, [filters.status, setLocation]);
  
  // Monitor modal state changes
  useEffect(() => {
    console.log("Modal state changed to:", pipelineModalOpen);
  }, [pipelineModalOpen]);
  
  // Fetch jobs with filters
  const { data, isLoading, error } = useQuery<JobWithTriggers[]>({
    queryKey: ['/api/jobs', filters],
    queryFn: async ({ queryKey }) => {
      const [_endpoint, appliedFilters] = queryKey as [string, JobFilters];
      const filterParams = new URLSearchParams();
      
      if (appliedFilters.type) filterParams.append('type', appliedFilters.type);
      if (appliedFilters.status) filterParams.append('status', appliedFilters.status);
      if (appliedFilters.dateFrom) filterParams.append('dateFrom', appliedFilters.dateFrom);
      if (appliedFilters.dateTo) filterParams.append('dateTo', appliedFilters.dateTo);
      
      const queryString = filterParams.toString() ? `?${filterParams.toString()}` : '';
      const response = await fetch(`/api/jobs${queryString}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      return response.json();
    }
  });
  
  // Fetch pipelines
  const { 
    data: pipelines, 
    isLoading: isPipelinesLoading, 
    error: pipelinesError 
  } = useQuery<Pipeline[]>({
    queryKey: ['/api/pipelines'],
    queryFn: async () => {
      const response = await fetch('/api/pipelines', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch pipelines');
      }
      
      return response.json();
    }
  });
  
  // Status card data
  const pendingJobs = data?.filter(job => job.status === "pending") || [];
  const processingJobs = data?.filter(job => job.status === "processing") || [];
  const completedJobs = data?.filter(job => job.status === "completed") || [];
  
  return (
    <Box sx={{ py: 3 }}>
      <Container>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          >
            Failed to load jobs. Please try again.
          </Alert>
        ) : (
          <>
            {/* Status Cards */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
              {/* Pending Card */}
              <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                  '&:hover': {
                    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
                  },
                }}>
                  <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div" fontWeight="medium">
                        Pending
                      </Typography>
                      <Clock size={20} color="#9ca3af" />
                    </Box>
                    <Typography variant="h3" component="div" fontWeight="bold" sx={{ my: 1 }}>
                      {pendingJobs.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Waiting to be processed
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              
              {/* Processing Card */}
              <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                  '&:hover': {
                    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
                  },
                }}>
                  <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div" fontWeight="medium">
                        Processing
                      </Typography>
                      <RefreshCw size={20} color="#3b82f6" />
                    </Box>
                    <Typography variant="h3" component="div" fontWeight="bold" sx={{ my: 1 }}>
                      {processingJobs.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Currently running
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              
              {/* Completed Card */}
              <Box sx={{ flexBasis: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                  '&:hover': {
                    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
                  },
                }}>
                  <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div" fontWeight="medium">
                        Completed
                      </Typography>
                      <CheckCircle size={20} color="#22c55e" />
                    </Box>
                    <Typography variant="h3" component="div" fontWeight="bold" sx={{ my: 1 }}>
                      {completedJobs.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Successfully finished
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Pipelines */}
            <Paper 
              sx={{ 
                mb: 4, 
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="medium">
                  Pipelines
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Create New Pipeline">
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<GitBranch size={16} />}
                      onClick={() => {
                        console.log("Setting pipeline modal open to true");
                        setPipelineModalOpen(true);
                        console.log("Pipeline modal state:", pipelineModalOpen);
                      }}
                    >
                      New Pipeline
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>NAME</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>CREATED</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>DESCRIPTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isPipelinesLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : pipelinesError ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography color="error">Failed to load pipelines</Typography>
                        </TableCell>
                      </TableRow>
                    ) : pipelines && pipelines.length > 0 ? (
                      pipelines.map((pipeline) => (
                        <TableRow 
                          key={pipeline.id}
                          onClick={() => setLocation(`/pipeline/${pipeline.id}`)}
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)', cursor: 'pointer' }
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {pipeline.id}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {pipeline.name}
                          </TableCell>
                          <TableCell>
                            {pipeline.status === "active" && (
                              <Chip
                                label="Active"
                                size="small"
                                color="success"
                                sx={{ textTransform: 'capitalize', '& .MuiChip-label': { pl: 0.5 } }}
                              />
                            )}
                            {pipeline.status === "archived" && (
                              <Chip
                                label="Archived"
                                size="small"
                                color="default"
                                sx={{ textTransform: 'capitalize', '& .MuiChip-label': { pl: 0.5 } }}
                              />
                            )}
                            {pipeline.status === "completed" && (
                              <Chip
                                label="Completed"
                                size="small"
                                color="info"
                                sx={{ textTransform: 'capitalize', '& .MuiChip-label': { pl: 0.5 } }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(pipeline.created_at).toLocaleDateString('en-US', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false
                            })}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pipeline.description || 'No description'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography variant="body1" color="text.secondary">
                            No pipelines found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Recent Jobs */}
            <Paper 
              sx={{ 
                mb: 4, 
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="medium">
                  Recent Jobs
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>PIPELINE</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>TYPE</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>CREATED</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data && data.length > 0 ? (
                      data.slice(0, 10).map((job) => (
                        <TableRow 
                          key={job.id}
                          onClick={() => setLocation(`/job/${job.id}`)}
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)', cursor: 'pointer' }
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {job.id}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="text"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/pipeline/${job.pipeline_id}`);
                              }}
                              sx={{ textTransform: 'none', p: 0 }}
                            >
                              {job.pipeline_id}
                            </Button>
                          </TableCell>
                          <TableCell>{job.type}</TableCell>
                          <TableCell>
                            {job.status === "pending" && (
                              <Chip
                                label="Pending"
                                size="small"
                                color="default"
                                icon={<Clock size={16} />}
                                sx={{ textTransform: 'capitalize', '& .MuiChip-label': { pl: 0.5 } }}
                              />
                            )}
                            {job.status === "processing" && (
                              <Chip
                                label="Processing"
                                size="small"
                                color="info"
                                icon={<RefreshCw size={16} />}
                                sx={{ textTransform: 'capitalize', '& .MuiChip-label': { pl: 0.5 } }}
                              />
                            )}
                            {job.status === "completed" && (
                              <Chip
                                label="Completed"
                                size="small"
                                color="success"
                                icon={<CheckCircle size={16} />}
                                sx={{ textTransform: 'capitalize', '& .MuiChip-label': { pl: 0.5 } }}
                              />
                            )}
                            {job.status === "failed" && (
                              <Chip
                                label="Failed"
                                size="small"
                                color="error"
                                icon={<AlertCircle size={16} />}
                                sx={{ textTransform: 'capitalize', '& .MuiChip-label': { pl: 0.5 } }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(job.created_at).toLocaleDateString('en-US', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false
                            })}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="text"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click from also triggering
                                setLocation(`/job/${job.id}`);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No jobs found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Container>
      
      {/* Pipeline Creation Modal */}
      <SimplePipelineModal 
        open={pipelineModalOpen}
        onClose={() => setPipelineModalOpen(false)}
      />
    </Box>
  );
}