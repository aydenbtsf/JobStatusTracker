import { useState } from "react";
import { useParams, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Chip,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton
} from "@mui/material";
import {
  ArrowLeft,
  RefreshCw,
  Tag,
  Calendar,
  FileText,
  Workflow,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Archive,
  Trash2
} from "lucide-react";
import { Pipeline, JobWithTriggers } from "@/lib/types";
import { getStatusColor, formatFullDate } from "@/lib/utils";
import { prettyJSON } from "@/lib/utils";
import { JobTimeline } from "../components/JobTimeline";

export default function PipelineDetailsPage() {
  const router = useRouter();
  const { id } = useParams({ from: '/pipeline/$id' });
  
  // Fetch pipeline details
  const {
    data: pipeline,
    isLoading: isPipelineLoading,
    error: pipelineError,
    refetch: refetchPipeline
  } = useQuery<Pipeline>({
    queryKey: ['/api/pipelines', id],
    queryFn: async ({ queryKey }) => {
      const [_endpoint, pipelineId] = queryKey as [string, string];
      if (!pipelineId) throw new Error("No pipeline ID provided");
      
      const response = await fetch(`/api/pipelines/${pipelineId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pipeline with ID: ${pipelineId}`);
      }
      
      return response.json();
    },
    enabled: !!id
  });
  
  // Fetch pipeline's jobs
  const {
    data: jobs,
    isLoading: isJobsLoading,
    error: jobsError,
    refetch: refetchJobs
  } = useQuery<JobWithTriggers[]>({
    queryKey: ['/api/jobs', { pipeline_id: id }],
    queryFn: async ({ queryKey }) => {
      const [_endpoint, filters] = queryKey as [string, { pipeline_id: string }];
      if (!filters.pipeline_id) throw new Error("No pipeline ID provided");
      
      const response = await fetch(`/api/jobs?pipeline_id=${filters.pipeline_id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs for pipeline: ${filters.pipeline_id}`);
      }
      
      return response.json();
    },
    enabled: !!id
  });
  
  const handleRefresh = () => {
    refetchPipeline();
    refetchJobs();
  };
  
  const getStatusChip = (status: string): JSX.Element => {
    let color: "default" | "primary" | "secondary" | "success" | "error" | "warning" | "info";
    
    switch (status) {
      case "active":
        color = "success";
        break;
      case "archived":
        color = "default";
        break;
      case "completed":
        color = "info";
        break;
      default:
        color = "default";
    }
    
    return (
      <Chip
        label={status}
        color={color}
        size="small"
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };
  
  const isLoading = isPipelineLoading || isJobsLoading;
  const error = pipelineError || jobsError;
  
  return (
    <Box sx={{ py: 3 }}>
      <Container>
        {/* Back button */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={() => router.navigate({ to: "/" })}
            variant="text"
            color="inherit"
            sx={{ ml: -1 }}
          >
            Back to Dashboard
          </Button>
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert 
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Retry
              </Button>
            }
          >
            Failed to load pipeline details. Please try again.
          </Alert>
        ) : pipeline ? (
          <>
            {/* Pipeline Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  {pipeline.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Tag size={16} color="#6b7280" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {pipeline.id}
                  </Typography>
                  <Divider orientation="vertical" flexItem sx={{ mx: 2, height: 16 }} />
                  <Calendar size={16} color="#6b7280" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    Created on {formatFullDate(pipeline.created_at)}
                  </Typography>
                  <Divider orientation="vertical" flexItem sx={{ mx: 2, height: 16 }} />
                  {getStatusChip(pipeline.status)}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Edit Pipeline">
                  <IconButton size="small">
                    <Edit size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Archive Pipeline">
                  <IconButton size="small">
                    <Archive size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Pipeline">
                  <IconButton size="small" color="error">
                    <Trash2 size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {/* Pipeline Details */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
              <Box sx={{ flex: '1 1 60%', minWidth: '280px' }}>
                <Paper sx={{ height: '100%', p: 3 }}>
                  <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
                    Details
                  </Typography>
                  
                  {pipeline.description && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {pipeline.description}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: '1 1 45%', minWidth: '120px' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        ID
                      </Typography>
                      <Typography variant="body2">
                        {pipeline.id}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 45%', minWidth: '120px' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Status
                      </Typography>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {pipeline.status}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 45%', minWidth: '120px' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Created
                      </Typography>
                      <Typography variant="body2">
                        {formatFullDate(pipeline.created_at)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 45%', minWidth: '120px' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Last Updated
                      </Typography>
                      <Typography variant="body2">
                        {formatFullDate(pipeline.updated_at)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
              
              <Box sx={{ flex: '1 1 30%', minWidth: '280px' }}>
                <Paper sx={{ height: '100%', p: 3 }}>
                  <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
                    Metadata
                  </Typography>
                  
                  {pipeline.metadata ? (
                    <Box 
                      component="pre" 
                      sx={{ 
                        p: 2, 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)', 
                        borderRadius: 1,
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        m: 0
                      }}
                    >
                      {prettyJSON(pipeline.metadata)}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No metadata available.
                    </Typography>
                  )}
                </Paper>
              </Box>
            </Box>
            
            {/* Pipeline Stats */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 20%', minWidth: '200px' }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total Jobs
                        </Typography>
                        <Workflow size={20} color="#6b7280" />
                      </Box>
                      <Typography variant="h4" fontWeight="bold">
                        {jobs?.length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                
                <Box sx={{ flex: '1 1 20%', minWidth: '200px' }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Completed
                        </Typography>
                        <CheckCircle size={20} color="#22c55e" />
                      </Box>
                      <Typography variant="h4" fontWeight="bold">
                        {jobs?.filter(job => job.status === "completed").length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                
                <Box sx={{ flex: '1 1 20%', minWidth: '200px' }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Pending
                        </Typography>
                        <Clock size={20} color="#9ca3af" />
                      </Box>
                      <Typography variant="h4" fontWeight="bold">
                        {jobs?.filter(job => job.status === "pending").length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
                
                <Box sx={{ flex: '1 1 20%', minWidth: '200px' }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Failed
                        </Typography>
                        <AlertCircle size={20} color="#ef4444" />
                      </Box>
                      <Typography variant="h4" fontWeight="bold">
                        {jobs?.filter(job => job.status === "failed").length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
            
            {/* Job Timeline */}
            <Paper
              sx={{
                mb: 4,
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <Typography variant="h6" fontWeight="medium">
                  Job Processing Timeline
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <JobTimeline jobs={jobs} isLoading={isJobsLoading} />
              </Box>
            </Paper>
            
            {/* Jobs Table */}
            <Paper
              sx={{
                mb: 4,
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(0, 0, 0, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="medium">
                  Pipeline Jobs
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<RefreshCw size={16} />}
                  onClick={handleRefresh}
                >
                  Refresh
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>TYPE</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>CREATED</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>UPDATED</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobs && jobs.length > 0 ? (
                      jobs.map((job) => (
                        <TableRow 
                          key={job.id}
                          onClick={() => router.navigate({ to: `/job/${job.id}` })}
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)', cursor: 'pointer' }
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {job.id}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                            {job.type.replace(/([A-Z])/g, ' $1').trim()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={job.status}
                              size="small"
                              color={getStatusColor(job.status)}
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                          <TableCell>{formatFullDate(job.created_at)}</TableCell>
                          <TableCell>{formatFullDate(job.updated_at)}</TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.navigate({ to: `/job/${job.id}` });
                              }}
                            >
                              <FileText size={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            No jobs found for this pipeline.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        ) : null}
      </Container>
    </Box>
  );
}