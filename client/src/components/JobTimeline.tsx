import { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps
} from 'recharts';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { JobWithTriggers } from '@/lib/types';
import { getStatusColor, getStatusVariant } from '@/lib/utils';

// Custom tooltip component for the timeline
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const job = payload[0].payload.job;
    
    return (
      <Paper sx={{ p: 2, maxWidth: 300, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          {job.type}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          ID: {job.id}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Status: <Typography component="span" color={getStatusVariant(job.status)} sx={{ fontWeight: 500 }}>
            {job.status}
          </Typography>
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          Start: {format(parseISO(job.created_at), 'MMM d, yyyy HH:mm:ss')}
        </Typography>
        <Typography variant="body2">
          Last update: {format(parseISO(job.updated_at), 'MMM d, yyyy HH:mm:ss')}
        </Typography>
      </Paper>
    );
  }
  
  return null;
};

interface JobTimelineProps {
  jobs: JobWithTriggers[] | undefined;
  isLoading: boolean;
}

export function JobTimeline({ jobs, isLoading }: JobTimelineProps) {
  const theme = useTheme();
  const [timelineData, setTimelineData] = useState<any[]>([]);
  
  useEffect(() => {
    if (!jobs || jobs.length === 0) return;
    
    // Find the earliest and latest dates in the job set
    const sortedByCreatedAt = [...jobs].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    const earliestDate = new Date(sortedByCreatedAt[0].created_at);
    const latestDate = jobs.reduce((latest, job) => {
      const updatedAt = new Date(job.updated_at);
      return updatedAt > latest ? updatedAt : latest;
    }, new Date(jobs[0].updated_at));
    
    // Calculate duration in minutes from the start of the first job
    const formattedData = jobs.map(job => {
      const startMinutes = differenceInMinutes(new Date(job.created_at), earliestDate);
      // For completed jobs, use the updated_at timestamp as end time
      // For in-progress jobs (pending or processing), use current time as end
      const endMinutes = job.status === 'completed' || job.status === 'failed' 
        ? differenceInMinutes(new Date(job.updated_at), earliestDate)
        : differenceInMinutes(new Date(), earliestDate);
      
      const duration = endMinutes - startMinutes;
      
      return {
        name: job.id,
        start: startMinutes,
        duration: duration > 0 ? duration : 1, // Ensure at least 1 minute duration for visibility
        status: job.status,
        job: job
      };
    });
    
    setTimelineData(formattedData);
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
  
  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={timelineData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            label={{ value: 'Minutes from first job', position: 'insideBottom', offset: -5 }} 
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={120}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine x={0} stroke="#000" />
          {timelineData.map((entry, index) => (
            <Bar 
              key={`${entry.name}-${index}`}
              dataKey="duration" 
              stackId="a" 
              fill={theme.palette[getStatusColor(entry.status)].main} 
              radius={[0, 4, 4, 0]}
              barSize={20}
              name={entry.job.type}
              // Use startOffset prop to position the bar
              startOffset={entry.start}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default JobTimeline;