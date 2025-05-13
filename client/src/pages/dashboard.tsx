import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { JobWithTriggers, JobFilters } from "@/lib/types";
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
  Link
} from "@mui/material";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw 
} from "lucide-react";

interface StatusCount {
  status: "all" | JobStatus;
  count: number;
  label: string;
}

// Initial status count data
const statusCounts = [
  { status: "all" as const, count: 0, label: "All Jobs" },
  { status: "pending" as JobStatus, count: 0, label: "Pending" },
  { status: "processing" as JobStatus, count: 0, label: "Processing" },
  { status: "completed" as JobStatus, count: 0, label: "Completed" },
  { status: "failed" as JobStatus, count: 0, label: "Failed" },
];

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useLocation();
  
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
  
  // Update status counts based on data
  const counts = statusCounts.map(item => {
    if (item.status === "all") {
      return { ...item, count: data?.length || 0 };
    }
    
    return {
      ...item,
      count: data?.filter(job => job.status === item.status).length || 0
    };
  });
  
  // Filter jobs by search term (client-side)
  const filteredJobs = data?.filter(job => 
    !searchTerm || 
    job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle status tab change
  const handleStatusChange = (status: StatusCount["status"]) => {
    setFilters(prev => ({
      ...prev,
      status: status === "all" ? "" : status
    }));
  };
  
  // Check if tab is active
  const isActive = (status: StatusCount["status"]) => {
    if (status === "all") {
      return !filters.status;
    }
    return filters.status === status;
  };

  // Helper function to get status chip color
  const getStatusChipColor = (status: JobStatus) => {
    switch (status) {
      case "pending": return "default";
      case "processing": return "info";
      case "completed": return "success";
      case "failed": return "error";
      default: return "default";
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case "pending": return <Clock size={16} />;
      case "processing": return <RefreshCw size={16} />;
      case "completed": return <CheckCircle size={16} />;
      case "failed": return <AlertCircle size={16} />;
      default: return null;
    }
  };

  // Status card data
  type StatusCardItem = {
    status: JobStatus;
    count: number;
    label: string;
    description: string;
    icon: JSX.Element;
  };

  const statusCardData: StatusCardItem[] = [
    { 
      status: "pending", 
      count: data?.filter(job => job.status === "pending").length || 0,
      label: "Pending", 
      description: "Waiting to be processed",
      icon: <Clock size={20} color="#9ca3af" />
    },
    { 
      status: "processing", 
      count: data?.filter(job => job.status === "processing").length || 0,
      label: "Processing", 
      description: "Currently running",
      icon: <RefreshCw size={20} color="#3b82f6" />
    },
    { 
      status: "completed", 
      count: data?.filter(job => job.status === "completed").length || 0,
      label: "Completed", 
      description: "Successfully finished",
      icon: <CheckCircle size={20} color="#22c55e" />
    }
  ];

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
              {statusCardData.map((card) => (
                <Box key={card.status.toString()} sx={{ flexBasis: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
                      },
                    }}
                  >
                    <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="div" fontWeight="medium">
                          {card.label}
                        </Typography>
                        {card.icon}
                      </Box>
                      <Typography variant="h3" component="div" fontWeight="bold" sx={{ my: 1 }}>
                        {card.count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {card.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Recent Jobs */}
            <Paper 
              sx={{ 
                mb: 4, 
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <Typography variant="h6" fontWeight="medium">
                  Recent Jobs
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>TYPE</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>CREATED</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredJobs?.slice(0, 10).map((job) => (
                      <TableRow 
                        key={job.id}
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {job.id}
                        </TableCell>
                        <TableCell>{job.type}</TableCell>
                        <TableCell>
                          {/* Use conditional rendering for the chip based on job status */}
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
                          <Link 
                            href={`/job/${job.id}`} 
                            underline="hover"
                            sx={{ cursor: 'pointer' }}
                          >
                            View Details
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredJobs?.length === 0 && (
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
    </Box>
  );
}