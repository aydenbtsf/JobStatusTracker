import { useState } from "react";
import { Link } from "wouter";
import { JobWithTriggers } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { formatDate, formatFullDate, getStatusVariant, prettyJSON } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

// Material UI imports
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Collapse,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled
} from "@mui/material";

interface JobCardProps {
  job: JobWithTriggers;
}

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const CardHeaderWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
}));

const JobTypeAndStatus = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const JobDateAndExpand = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const CodeBlock = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  overflowX: 'auto',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  maxHeight: '120px',
  overflowY: 'auto',
}));

// Helper function to get MUI color from job status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'completed': return 'success';
    case 'failed': return 'error';
    default: return 'default';
  }
};

export function JobCard({ job }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const handleRetry = async () => {
    try {
      await apiRequest("POST", `/api/jobs/${job.id}/retry`, {});
      toast({
        title: "Job retry request sent",
        description: "The job has been submitted for retry",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    } catch (error) {
      toast({
        title: "Failed to retry job",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <StyledCard>
      <CardHeader
        disableTypography
        action={
          <IconButton 
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
            size="small"
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </IconButton>
        }
        title={
          <CardHeaderWrapper>
            <JobTypeAndStatus>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 500 }}>
                {job.type}
              </Typography>
              <Chip 
                label={job.status}
                size="small"
                color={getStatusColor(job.status)}
                sx={{ ml: 1.5, textTransform: 'capitalize' }}
              />
            </JobTypeAndStatus>
            <JobDateAndExpand>
              <Typography variant="body2" color="text.secondary">
                {formatDate(job.createdAt)}
              </Typography>
            </JobDateAndExpand>
          </CardHeaderWrapper>
        }
        subheader={
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {job.id}
          </Typography>
        }
        sx={{ pb: 0 }}
      />
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 2, pb: 1, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
              <Typography variant="body2">{formatFullDate(job.createdAt)}</Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Updated At</Typography>
              <Typography variant="body2">{formatFullDate(job.updatedAt)}</Typography>
            </Box>
            
            {job.errorMessage && (
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 2' } }}>
                <Typography variant="subtitle2" color="text.secondary">Error Message</Typography>
                <Typography variant="body2" color="error.main">{job.errorMessage}</Typography>
              </Box>
            )}
            
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 2' } }}>
              <Typography variant="subtitle2" color="text.secondary">Arguments</Typography>
              <CodeBlock>
                <pre style={{ margin: 0 }}>{prettyJSON(job.args)}</pre>
              </CodeBlock>
            </Box>
            
            {job.triggers && job.triggers.length > 0 && (
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 2' } }}>
                <Typography variant="subtitle2" color="text.secondary">Triggers</Typography>
                <Box sx={{ mt: 1 }}>
                  {job.triggers.map(trigger => (
                    <Box 
                      key={trigger.id} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 1.5, 
                        mb: 1, 
                        border: '1px solid', 
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.paper'
                      }}
                    >
                      <Chip 
                        label={trigger.status} 
                        size="small" 
                        color={getStatusColor(trigger.status)} 
                      />
                      <Typography variant="body2" fontWeight={500} sx={{ ml: 1.5 }}>
                        {trigger.type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5 }}>
                        {trigger.id}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            
            {job.waveForecastData && job.waveForecastData.data && job.waveForecastData.data.length > 0 && (
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 2' } }}>
                <Typography variant="subtitle2" color="text.secondary">Wave Forecast Data</Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Height (m)</TableCell>
                        <TableCell>Direction</TableCell>
                        <TableCell>Period (s)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {job.waveForecastData.data.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>{entry.time}</TableCell>
                          <TableCell>{entry.height}</TableCell>
                          <TableCell>{entry.direction}</TableCell>
                          <TableCell>{entry.period}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleRetry}
              disabled={job.status === 'processing' || job.status === 'completed'}
            >
              Retry
            </Button>
            <Button variant="contained" component={Link} href={`/jobs/${job.id}`}>
              View Full Details
            </Button>
          </Box>
        </CardContent>
      </Collapse>
    </StyledCard>
  );
}