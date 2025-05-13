import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { StatusTabs } from "@/components/status-tabs";
import { JobFilters } from "@/components/job-filters";
import { JobCard } from "@/components/job-card";
import { CreateJobModal } from "@/components/create-job-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JobWithTriggers } from "@/lib/types";
import { Search, Menu, Bell, Plus } from "lucide-react";
import { JobStatus } from "@shared/schema";

// Material UI imports
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Grid,
  Paper,
  InputAdornment,
  TextField,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Stack
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Status counts interface
interface StatusCount {
  status: "all" | JobStatus;
  count: number;
  label: string;
}

const statusCounts = [
  { status: "all" as const, count: 0, label: "All Jobs" },
  { status: "pending" as JobStatus, count: 0, label: "Pending" },
  { status: "processing" as JobStatus, count: 0, label: "Processing" },
  { status: "completed" as JobStatus, count: 0, label: "Completed" },
  { status: "failed" as JobStatus, count: 0, label: "Failed" },
];

// Styled components for dashboard
const DashboardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  overflow: 'hidden',
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflow: 'auto',
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useLocation();
  
  // Parse query parameters
  const params = new URLSearchParams(location.split('?')[1] || '');
  const filterStatus = params.get('status') as JobStatus | null;
  
  const [filters, setFilters] = useState({
    type: "",
    status: filterStatus || "",
    dateFrom: "",
    dateTo: "",
  });
  
  // Fetch jobs with filters
  const { data, isLoading, error } = useQuery<JobWithTriggers[]>({
    queryKey: ['/api/jobs', filters],
    queryFn: async ({ queryKey }) => {
      const [_endpoint, appliedFilters] = queryKey as [string, typeof filters];
      const filterParams = new URLSearchParams();
      
      if (appliedFilters.type) filterParams.append('type', appliedFilters.type);
      if (appliedFilters.status) filterParams.append('status', appliedFilters.status);
      if (appliedFilters.dateFrom) filterParams.append('dateFrom', appliedFilters.dateFrom);
      if (appliedFilters.dateTo) filterParams.append('dateTo', appliedFilters.dateTo);
      
      const queryString = filterParams.toString() ? `?${filterParams.toString()}` : '';
      // Get the API base URL from environment or use default
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const fullUrl = `${apiBaseUrl}/api/jobs${queryString}`;
      const response = await fetch(fullUrl, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      return response.json();
    }
  });
  
  // Update status counts
  const counts = statusCounts.map(item => {
    if (item.status === "all") {
      return { ...item, count: data?.length || 0 };
    }
    
    return {
      ...item,
      count: data?.filter(job => job.status === item.status).length || 0
    };
  }) as StatusCount[];
  
  const handleFilterChange = (newFilters: {
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Update URL if status filter changes
    if (newFilters.status !== undefined && newFilters.status !== filters.status) {
      if (newFilters.status) {
        setLocation(`/?status=${newFilters.status}`);
      } else {
        setLocation('/');
      }
    }
  };
  
  // Filter jobs by search term (client-side)
  const filteredJobs = data?.filter(job => 
    !searchTerm || 
    job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardContainer>
      <Sidebar />
      
      <MainContent>
        {/* Top AppBar */}
        <StyledAppBar position="sticky" color="default" elevation={0}>
          <Toolbar>
            <IconButton 
              edge="start" 
              color="inherit" 
              aria-label="menu"
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <Menu />
            </IconButton>
            
            <Box sx={{ flexGrow: 1, maxWidth: 500 }}>
              <SearchField
                fullWidth
                variant="outlined"
                placeholder="Search jobs..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit">
                <Bell size={20} />
              </IconButton>
              <Avatar 
                alt="User profile"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                sx={{ width: 32, height: 32, ml: 1 }}
              />
            </Box>
          </Toolbar>
        </StyledAppBar>
        
        {/* Main Dashboard Content */}
        <ContentContainer>
          <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Job Dashboard
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => setIsCreateModalOpen(true)}
                  startIcon={<Plus size={16} />}
                >
                  Create Job
                </Button>
              </Box>
              
              {/* Filters Panel */}
              <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                <JobFilters onFilterChange={handleFilterChange} />
              </Paper>
              
              {/* Status Tabs */}
              <Box sx={{ mb: 3 }}>
                <StatusTabs counts={counts} />
              </Box>
              
              {/* Jobs List */}
              <Box>
                {isLoading ? (
                  // Loading state
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Paper key={index} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ width: 150, height: 24, bgcolor: 'grey.200', borderRadius: 1 }} />
                            <Box sx={{ width: 80, height: 24, bgcolor: 'grey.200', borderRadius: 10 }} />
                          </Stack>
                          <Box sx={{ width: 100, height: 24, bgcolor: 'grey.200', borderRadius: 1 }} />
                        </Box>
                        <Box sx={{ width: '60%', height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                      </Paper>
                    ))}
                  </Box>
                ) : error ? (
                  // Error state
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
                    Failed to load jobs. Please try again.
                  </Alert>
                ) : filteredJobs && filteredJobs.length > 0 ? (
                  // Display jobs
                  <Stack spacing={2}>
                    {filteredJobs.map(job => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </Stack>
                ) : (
                  // Empty state
                  <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      No jobs found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {searchTerm 
                        ? 'No jobs match your search criteria.' 
                        : 'There are no jobs with the selected filters.'
                      }
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      Create a new job
                    </Button>
                  </Paper>
                )}
              </Box>
              
              {/* Pagination area */}
              {filteredJobs && filteredJobs.length > 0 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing <b>1</b> to <b>{filteredJobs.length}</b> of <b>{filteredJobs.length}</b> results
                  </Typography>
                </Box>
              )}
            </Box>
          </Container>
        </ContentContainer>
      </MainContent>
      
      {/* Create job modal */}
      <CreateJobModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </DashboardContainer>
  );
}