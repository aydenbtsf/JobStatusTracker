import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { JobWithTriggers, JobFilters } from "@/lib/types";
import { JobStatus, JobType } from "@shared/schema";
import { JobCard } from "@/components/job-card";
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Tabs,
  Tab,
  InputAdornment
} from "@mui/material";
import { Search as SearchIcon } from "lucide-react";

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

// Function to get color based on status
function getStatusTabColor(status: StatusCount["status"]): "default" | "primary" | "secondary" | "success" | "error" | "warning" | "info" {
  switch (status) {
    case "pending": return "warning";
    case "processing": return "info";
    case "completed": return "success";
    case "failed": return "error";
    case "all": default: return "primary";
  }
}

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

  return (
    <Box sx={{ py: 4 }}>
      <Container>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Job Dashboard
        </Typography>
        
        {/* Status Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Box sx={{ display: 'flex', overflowX: 'auto' }}>
            {counts.map((item) => (
              <Box 
                key={item.status}
                onClick={() => handleStatusChange(item.status)}
                sx={{ 
                  px: 2, 
                  py: 1.5, 
                  cursor: 'pointer',
                  borderBottom: '2px solid',
                  borderBottomColor: isActive(item.status) ? 'primary.main' : 'transparent',
                  color: isActive(item.status) ? 'primary.main' : 'text.secondary',
                  fontWeight: isActive(item.status) ? 500 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    color: 'primary.main',
                    borderBottomColor: isActive(item.status) ? 'primary.main' : 'primary.light',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <Typography variant="body2" sx={{ mr: 1 }}>
                  {item.label}
                </Typography>
                <Chip
                  label={item.count}
                  size="small"
                  color={getStatusTabColor(item.status)}
                />
              </Box>
            ))}
          </Box>
        </Box>
        
        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search jobs by ID or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={20} />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Box>
        
        {/* Loading and Error States */}
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
            {/* Results Count */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredJobs?.length} job{filteredJobs?.length !== 1 ? 's' : ''} found
              </Typography>
            </Box>
            
            {/* Job Cards */}
            {filteredJobs?.length ? (
              <Stack spacing={2}>
                {filteredJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </Stack>
            ) : (
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No jobs found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your search or filter criteria.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}