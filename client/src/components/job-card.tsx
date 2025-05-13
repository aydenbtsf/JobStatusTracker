import { Link } from "wouter";
import { JobWithTriggers } from "@/lib/types";
import { getStatusColor, formatDate } from "@/lib/utils";
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Stack
} from "@mui/material";

interface JobCardProps {
  job: JobWithTriggers;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card sx={{ mb: 2, boxShadow: 1, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Link href={`/jobs/${job.id}`}>
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              {job.id}
            </Typography>
          </Link>
          <Chip 
            label={job.status} 
            size="small" 
            color={getStatusColor(job.status) as "default" | "primary" | "secondary" | "success" | "error" | "warning" | "info"}
          />
        </Box>
        
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Type: <strong>{job.type}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Created: <strong>{formatDate(job.createdAt)}</strong>
          </Typography>
        </Stack>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight={500}>
            Arguments
          </Typography>
          <Box 
            component="pre" 
            sx={{ 
              backgroundColor: 'background.paper', 
              p: 1, 
              borderRadius: 1, 
              overflow: 'auto',
              fontSize: '0.75rem',
              mt: 1,
              maxHeight: '80px'
            }}
          >
            {JSON.stringify(job.args, null, 2)}
          </Box>
        </Box>
        
        {job.triggers.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={500}>
              Triggers ({job.triggers.length})
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
              {job.triggers.map(trigger => (
                <Chip 
                  key={trigger.id}
                  label={`${trigger.id} (${trigger.status})`}
                  size="small"
                  variant="outlined"
                  component={Link}
                  href={`/jobs/${trigger.id}`}
                  clickable
                />
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}