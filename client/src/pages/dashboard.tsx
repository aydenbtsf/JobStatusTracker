import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { JobWithTriggers } from "@/lib/types";
import { JobStatus } from "@shared/schema";
import { Box, Container, Typography, CircularProgress, Alert, Button } from "@mui/material";

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

export default function Dashboard() {
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
  
  // Filter jobs by search term (client-side)
  const filteredJobs = data?.filter(job => 
    !searchTerm || 
    job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ py: 4 }}>
      <Container>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Job Dashboard
        </Typography>
        
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
          <Typography variant="body1">
            {filteredJobs?.length} jobs found
          </Typography>
        )}
      </Container>
    </Box>
  );
}