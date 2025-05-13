import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { JobWithPipeline } from "@/lib/types";
import { formatFullDate, getStatusColor, prettyJSON } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent, 
  Chip, 
  Stack, 
  Paper, 
  Divider,
  Grid
} from "@mui/material";
import { 
  RepeatIcon,
  TrashIcon,
  ArrowLeftIcon,
  ClockIcon,
  CalendarIcon,
  AlertTriangleIcon,
  ActivityIcon
} from 'lucide-react';

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();
  
  const { data: job, isLoading, error } = useQuery<JobWithPipeline>({
    queryKey: [`/api/jobs/${id}`],
    queryFn: async ({ queryKey }) => {
      const [url] = queryKey as [string];
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch job details');
      return res.json();
    },
    refetchInterval: (query) => {
      if (query.state.data?.status === 'processing') {
        return 2000;
      }
      return false;
    },
  });
  
  const deleteJobMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setLocation('/');
    },
  });
  
  const retryJobMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/jobs/${id}/retry`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    },
  });
  
  const handleRetry = () => {
    retryJobMutation.mutate();
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      deleteJobMutation.mutate();
    }
  };
  
  const handleGoBack = () => {
    setLocation('/');
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !job) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          Failed to load job details. The job may have been deleted or an error occurred.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button 
            startIcon={<ArrowLeftIcon />} 
            onClick={handleGoBack}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={handleGoBack}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Job Details
        </Typography>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 3 }}>
            <Typography variant="h5" component="h2">
              {job.id}
            </Typography>
            <Chip 
              label={job.status}
              color={getStatusColor(job.status)}
              sx={{ fontWeight: 500 }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Pipeline Information
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Pipeline</Typography>
                    <Typography variant="body1" fontWeight={500}>{job.pipeline.name}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Pipeline ID</Typography>
                    <Typography variant="body1">{job.pipeline_id}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={job.pipeline.status}
                      color={job.pipeline.status === "active" ? "success" : 
                             job.pipeline.status === "completed" ? "info" : "default"}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  
                  {job.pipeline.description && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Description</Typography>
                      <Typography variant="body1">{job.pipeline.description}</Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
              
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Job Information
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Type</Typography>
                    <Typography variant="body1" fontWeight={500}>{job.type}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Updated</Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ClockIcon size={16} style={{ marginRight: '4px' }} />
                      {formatFullDate(job.updated_at)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">Created</Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon size={16} style={{ marginRight: '4px' }} />
                      {formatFullDate(job.created_at)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Actions
                </Typography>
                <Stack spacing={2} sx={{ flex: 1, justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<RepeatIcon />}
                    onClick={handleRetry}
                    disabled={retryJobMutation.isPending || job.status === 'processing'}
                  >
                    {retryJobMutation.isPending ? 'Retrying...' : 'Retry Job'}
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    color="error"
                    startIcon={<TrashIcon />}
                    onClick={handleDelete}
                    disabled={deleteJobMutation.isPending}
                  >
                    {deleteJobMutation.isPending ? 'Deleting...' : 'Delete Job'}
                  </Button>
                </Stack>
              </Paper>
            </Box>
          </Box>
          
          {job.error_message && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="subtitle2">Error</Typography>
              <Typography variant="body2">{job.error_message}</Typography>
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Arguments
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                backgroundColor: 'background.paper',
                borderRadius: 1,
              }}
            >
              <pre style={{ margin: 0, overflow: 'auto' }}>
                {prettyJSON(job.args)}
              </pre>
            </Paper>
          </Box>
          
          {job.wave_forecast_data && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Wave Forecast Data
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Location:</strong> {job.wave_forecast_data.location || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Unit:</strong> {job.wave_forecast_data.unit || 'N/A'}
                </Typography>
              </Paper>
              
              <Typography variant="subtitle2" gutterBottom>
                Forecast Entries
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Time</th>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Height</th>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Direction</th>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.wave_forecast_data.data.map((entry, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px' }}>{entry.time}</td>
                        <td style={{ padding: '8px' }}>{entry.height} m</td>
                        <td style={{ padding: '8px' }}>{entry.direction}</td>
                        <td style={{ padding: '8px' }}>{entry.period} s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Box>
          )}
          
          {job.triggers.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Triggers
              </Typography>
              <Stack spacing={2}>
                {job.triggers.map(trigger => (
                  <Paper 
                    key={trigger.id} 
                    variant="outlined" 
                    sx={{ 
                      p: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 1
                      }
                    }}
                    onClick={() => setLocation(`/job/${trigger.id}`)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={500}>{trigger.id}</Typography>
                      <Chip 
                        label={trigger.status} 
                        size="small" 
                        color={getStatusColor(trigger.status)}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Type: <strong>{trigger.type}</strong>
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}