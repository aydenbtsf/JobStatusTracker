import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { JobWithTriggers, JobFilters, Pipeline } from "@/lib/types";
import { JobStatus } from "@/schema";
import { styled } from "@mui/material/styles";
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Card as MuiCard,
  CardContent,
  Chip,
  Paper as MuiPaper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  GitBranch,
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

  
  // Monitor modal state changes
  useEffect(() => {
    console.log("Modal state changed to:", pipelineModalOpen);
  }, [pipelineModalOpen]);
  
  // Fetch jobs with filters
  const { data, isLoading, error } = useQuery<JobWithTriggers[]>({
    queryKey: ['jobs', filters],
    queryFn: async ({ queryKey }) => {
      const [_endpoint ] = queryKey as [string, JobFilters];
      const filterParams = new URLSearchParams();
      
      if (filters.type) filterParams.append('type', filters.type);
      if (filters.status) filterParams.append('status', filters.status);
      if (filters.dateFrom) filterParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) filterParams.append('dateTo', filters.dateTo);
      
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
    queryKey: ['pipelines'],
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
    <DashboardContainer>
      <Container>
        {isLoading ? (
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
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
            <StatusCardsContainer>
              {/* Pending Card */}
              <StatusCardWrapper>
                <Card>
                  <CardHeader>
                    <Typography variant="h6" component="div" fontWeight="medium">
                      Pending
                    </Typography>
                    <Clock size={20} color="#9ca3af" />
                  </CardHeader>
                  <StyledCardContent>
                    <Typography variant="h3" component="div" fontWeight="bold" sx={{ my: 1 }}>
                      {pendingJobs.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Waiting to be processed
                    </Typography>
                  </StyledCardContent>
                </Card>
              </StatusCardWrapper>
              
              {/* Processing Card */}
              <StatusCardWrapper>
                <Card>
                  <CardHeader>
                    <Typography variant="h6" component="div" fontWeight="medium">
                      Processing
                    </Typography>
                    <RefreshCw size={20} color="#3b82f6" />
                  </CardHeader>
                  <StyledCardContent>
                    <Typography variant="h3" component="div" fontWeight="bold" sx={{ my: 1 }}>
                      {processingJobs.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Currently running
                    </Typography>
                  </StyledCardContent>
                </Card>
              </StatusCardWrapper>
              
              {/* Completed Card */}
              <StatusCardWrapper>
                <Card>
                  <CardHeader>
                    <Typography variant="h6" component="div" fontWeight="medium">
                      Completed
                    </Typography>
                    <CheckCircle size={20} color="#22c55e" />
                  </CardHeader>
                  <StyledCardContent>
                    <Typography variant="h3" component="div" fontWeight="bold" sx={{ my: 1 }}>
                      {completedJobs.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Successfully finished
                    </Typography>
                  </StyledCardContent>
                </Card>
              </StatusCardWrapper>
            </StatusCardsContainer>

            {/* Pipelines */}
            <Paper>
              <PaperHeader>
                <Typography variant="h6" fontWeight="medium">
                  Pipelines
                </Typography>
                <ButtonContainer>
                  <Tooltip title="Create New Pipeline">
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<GitBranch size={16} />}
                      onClick={() => setPipelineModalOpen(true)}
                    >
                      New Pipeline
                    </Button>
                  </Tooltip>
                </ButtonContainer>
              </PaperHeader>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>ID</StyledTableCell>
                      <StyledTableCell>NAME</StyledTableCell>
                      <StyledTableCell>STATUS</StyledTableCell>
                      <StyledTableCell>CREATED</StyledTableCell>
                      <StyledTableCell>DESCRIPTION</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isPipelinesLoading ? (
                      <TableRow>
                        <EmptyStateCell colSpan={5}>
                          <CircularProgress size={24} />
                        </EmptyStateCell>
                      </TableRow>
                    ) : pipelinesError ? (
                      <TableRow>
                        <EmptyStateCell colSpan={5}>
                          <Typography color="error">Failed to load pipelines</Typography>
                        </EmptyStateCell>
                      </TableRow>
                    ) : pipelines && pipelines.length > 0 ? (
                      pipelines.map((pipeline) => (
                        <StyledTableRow key={pipeline.id}>
                          <TableCell component="th" scope="row">
                            {pipeline.id}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {pipeline.name}
                          </TableCell>
                          <TableCell>
                            {pipeline.status === "active" && (
                              <StyledChip
                                label="Active"
                                size="small"
                                color="success"
                              />
                            )}
                            {pipeline.status === "archived" && (
                              <StyledChip
                                label="Archived"
                                size="small"
                                color="default"
                              />
                            )}
                            {pipeline.status === "completed" && (
                              <StyledChip
                                label="Completed"
                                size="small"
                                color="info"
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
                          <TruncatedCell>
                            {pipeline.description || 'No description'}
                          </TruncatedCell>
                        </StyledTableRow>
                      ))
                    ) : (
                      <TableRow>
                        <EmptyStateCell colSpan={5}>
                          <Typography variant="body1" color="text.secondary">
                            No pipelines found
                          </Typography>
                        </EmptyStateCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Recent Jobs */}
            <Paper>
              <PaperHeader>
                <Typography variant="h6" fontWeight="medium">
                  Recent Jobs
                </Typography>
              </PaperHeader>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>ID</StyledTableCell>
                      <StyledTableCell>PIPELINE</StyledTableCell>
                      <StyledTableCell>TYPE</StyledTableCell>
                      <StyledTableCell>STATUS</StyledTableCell>
                      <StyledTableCell>CREATED</StyledTableCell>
                      <StyledTableCell>ACTIONS</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data && data.length > 0 ? (
                      data.slice(0, 10).map((job) => (
                        <StyledTableRow 
                          key={job.id}
                          onClick={() => setLocation(`/job/${job.id}`)}
                        >
                          <TableCell component="th" scope="row">
                            {job.id}
                          </TableCell>
                          <TableCell>
                            {job.pipeline_id}
                          </TableCell>
                          <TableCell>{job.type}</TableCell>
                          <TableCell>
                            {job.status === "pending" && (
                              <StyledChip
                                label="Pending"
                                size="small"
                                color="default"
                                icon={<Clock size={16} />}
                              />
                            )}
                            {job.status === "processing" && (
                              <StyledChip
                                label="Processing"
                                size="small"
                                color="info"
                                icon={<RefreshCw size={16} />}
                              />
                            )}
                            {job.status === "completed" && (
                              <StyledChip
                                label="Completed"
                                size="small"
                                color="success"
                                icon={<CheckCircle size={16} />}
                              />
                            )}
                            {job.status === "failed" && (
                              <StyledChip
                                label="Failed"
                                size="small"
                                color="error"
                                icon={<AlertCircle size={16} />}
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
                                e.stopPropagation();
                                setLocation(`/job/${job.id}`);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </StyledTableRow>
                      ))
                    ) : (
                      <TableRow>
                        <EmptyStateCell colSpan={5}>
                          <Typography variant="body1" color="text.secondary">
                            No jobs found
                          </Typography>
                        </EmptyStateCell>
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
    </DashboardContainer>
  );
}

// Styled Components
const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  paddingTop: 64,
  paddingBottom: 64
});

const StatusCardsContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 24,
  marginBottom: 32,
});

const StatusCardWrapper = styled(Box)(({ theme }) => ({
  flexBasis: '100%',
  [theme.breakpoints.up('md')]: {
    flexBasis: 'calc(33.33% - 16px)'
  }
}));

const Card = styled(MuiCard)({
  height: '100%',
  display: 'flex',
  padding: 8,
  flexDirection: 'column',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  '&:hover': {
    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)'
  }
});

const CardHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 16
});

const StyledCardContent = styled(CardContent)({
  flex: '1 0 auto',
  padding: 24
});

const Paper = styled(MuiPaper)({
  marginBottom: 32,
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  overflow: 'hidden'
});

const PaperHeader = styled(Box)({
  padding: 24,
  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

const StyledTableRow = styled(TableRow)({
  '&:last-child td, &:last-child th': { border: 0 },
  '&:hover': { 
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    cursor: 'pointer'
  }
});

const StyledTableCell = styled(TableCell)({
  fontWeight: 'bold'
});

const EmptyStateCell = styled(TableCell)({
  padding: '24px 0',
  textAlign: 'center'
});

const StyledChip = styled(Chip)(({ color }) => ({
  textTransform: 'capitalize',
  '& .MuiChip-label': { 
    paddingLeft: 4 
  }
}));

const ButtonContainer = styled(Box)({
  display: 'flex',
  gap: 8
});

const TruncatedCell = styled(TableCell)({
  maxWidth: 250,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
});

const DashboardContainer = styled(Box)({
  paddingTop: 24,
  paddingBottom: 24
});
