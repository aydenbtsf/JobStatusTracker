import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,
  useTheme,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { format, parseISO } from 'date-fns';
import { JobWithTriggers, JobType } from '@/lib/types';
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

export function JobTimeline({ jobs, isLoading }: JobTimelineProps) {
  const theme = useTheme();
  const [sortedJobs, setSortedJobs] = useState<JobWithTriggers[]>([]);
  
  useEffect(() => {
    if (!jobs || jobs.length === 0) return;
    
    // Sort jobs by creation date
    const sorted = [...jobs].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    setSortedJobs(sorted);
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
  
  // Always use success color for the timeline markers to match the design
  const getTimelineMarkerColor = () => {
    return theme.palette.success.main;
  };
  
  // Calculate the total width available for the timeline
  const timelineWidth = sortedJobs.length > 1 ? '100%' : '500px';
  
  return (
    <Box sx={{ width: '100%', px: 2, py: 3 }}>
      <Box 
        sx={{ 
          position: 'relative', 
          width: timelineWidth, 
          height: 80, 
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
            height: 2, 
            bgcolor: theme.palette.success.light,
            zIndex: 1
          }} 
        />
        
        {sortedJobs.map((job, index) => {
          // Calculate position as percentage of the timeline width
          const position = sortedJobs.length > 1 
            ? (index / (sortedJobs.length - 1)) * 100 
            : 50;
            
          const jobType = job.type as JobType;
          const displayName = jobTypeLabels[jobType] || job.type;
          const formattedTime = format(parseISO(job.created_at), 'hh:mm:00 a');
            
          return (
            <Tooltip 
              key={job.id}
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
                </Box>
              }
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: `${position}%`,
                  top: 20,
                  transform: 'translateX(-50%)',
                  zIndex: 2,
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
                    bgcolor: getTimelineMarkerColor(),
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
                  {formattedTime}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}

export default JobTimeline;