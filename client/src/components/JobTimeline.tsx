import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,
  useTheme,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { format, parseISO, differenceInMilliseconds } from 'date-fns';
import { JobWithTriggers } from '@/lib/types';
import { JobType } from '@shared/schema';
import { getStatusColor } from '@/lib/utils';

interface JobTimelineProps {
  jobs: JobWithTriggers[] | undefined;
  isLoading: boolean;
}

// Map job types to display labels
const jobTypeLabels: Record<JobType, string> = {
  fetchTerrain: 'Terrain',
  weatherForecast: 'Weather',
  tideForecast: 'Tide',
  waveForecast: 'Wave'
};

interface ProcessedJob {
  job: JobWithTriggers;
  displayName: string;
  startPosition: number;
  endPosition: number;
  startTime: string;
  endTime: string;
}

export function JobTimeline({ jobs, isLoading }: JobTimelineProps) {
  const theme = useTheme();
  const [processedJobs, setProcessedJobs] = useState<ProcessedJob[]>([]);
  
  useEffect(() => {
    if (!jobs || jobs.length === 0) return;
    
    // Sort jobs by creation date
    const sortedJobs = [...jobs].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    // Find the earliest and latest dates to calculate the timeline range
    const earliestDate = new Date(sortedJobs[0].created_at);
    const latestDate = sortedJobs.reduce((latest, job) => {
      const updatedAt = new Date(job.updated_at);
      return updatedAt > latest ? updatedAt : latest;
    }, new Date(sortedJobs[0].updated_at));
    
    // Calculate total timeline duration in milliseconds
    const totalDuration = differenceInMilliseconds(latestDate, earliestDate);
    
    // Process job positions and times
    const processed = sortedJobs.map(job => {
      const jobStartTime = new Date(job.created_at);
      const jobEndTime = new Date(job.updated_at);
      
      // Calculate positions as percentages
      const startPosition = totalDuration === 0 ? 0 : 
        (differenceInMilliseconds(jobStartTime, earliestDate) / totalDuration) * 100;
        
      const endPosition = totalDuration === 0 ? 100 : 
        (differenceInMilliseconds(jobEndTime, earliestDate) / totalDuration) * 100;
      
      // Format times for display
      const startTimeFormatted = format(jobStartTime, 'hh:mm:00 a');
      const endTimeFormatted = format(jobEndTime, 'hh:mm:00 a');
      
      const jobType = job.type as JobType;
      const displayName = jobTypeLabels[jobType] || job.type;
      
      return {
        job,
        displayName,
        startPosition,
        endPosition,
        startTime: startTimeFormatted,
        endTime: endTimeFormatted
      };
    });
    
    setProcessedJobs(processed);
  }, [jobs]);
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }
  
  if (!jobs || jobs.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No jobs available for timeline visualization.
        </Typography>
      </Box>
    );
  }
  
  // Always use success color for the timeline elements to match the design
  const getTimelineColor = () => theme.palette.success.main;
  const getTimelineLineColor = () => theme.palette.success.light;
  
  return (
    <Box sx={{ width: '100%', px: 2, py: 3 }}>
      <Box 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          height: 100, 
          mx: 'auto'
        }}
      >
        {/* Timeline base line */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 30, 
            left: 0, 
            right: 0, 
            height: 3, 
            bgcolor: getTimelineLineColor(),
            zIndex: 1
          }} 
        />
        
        {processedJobs.map((processedJob) => {
          const { job, displayName, startPosition, endPosition, startTime } = processedJob;
          
          // Ensure minimum segment width for visibility
          const segmentWidth = Math.max(endPosition - startPosition, 1);
          
          return (
            <Box key={job.id}>
              {/* Timeline segment representing job duration */}
              <Tooltip 
                title={
                  <Box>
                    <Typography variant="subtitle2">
                      {displayName} - {job.status}
                    </Typography>
                    <Typography variant="body2">
                      ID: {job.id}
                    </Typography>
                    <Typography variant="body2">
                      Created: {format(parseISO(job.created_at), 'MMM d, yyyy HH:mm:ss')}
                    </Typography>
                    <Typography variant="body2">
                      Updated: {format(parseISO(job.updated_at), 'MMM d, yyyy HH:mm:ss')}
                    </Typography>
                  </Box>
                }
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${startPosition}%`,
                    top: 30,
                    width: `${segmentWidth}%`,
                    height: 3,
                    bgcolor: getTimelineColor(),
                    zIndex: 2
                  }}
                />
              </Tooltip>
              
              {/* Start marker with job type label and time */}
              <Box
                sx={{
                  position: 'absolute',
                  left: `${startPosition}%`,
                  top: 20,
                  transform: 'translateX(-50%)',
                  zIndex: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Timeline marker dot */}
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    borderRadius: '50%', 
                    bgcolor: getTimelineColor(),
                    mb: 1,
                    border: '2px solid white',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }} 
                />
                
                {/* Job type label */}
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 'medium',
                    fontSize: '0.8rem'
                  }}
                >
                  {displayName}
                </Typography>
                
                {/* Time label */}
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  {startTime}
                </Typography>
              </Box>
              
              {/* End marker if the job has a different end position */}
              {endPosition > startPosition + 2 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${endPosition}%`,
                    top: 20,
                    transform: 'translateX(-50%)',
                    zIndex: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* Timeline marker dot */}
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      bgcolor: getTimelineColor(),
                      mb: 1,
                      border: '2px solid white',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }} 
                  />
                  
                  {/* Time label */}
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    {processedJob.endTime}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default JobTimeline;