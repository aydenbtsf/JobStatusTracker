import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { CreatePipelinePayload, PipelineStatus } from '@/lib/types';
import { 
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress
} from '@mui/material';

interface CreatePipelineModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePipelineModal({ open, onClose }: CreatePipelineModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<PipelineStatus>('active');
  const [metadata, setMetadata] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus('active');
    setMetadata('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const createPipelineMutation = useMutation({
    mutationFn: async (data: CreatePipelinePayload) => {
      return apiRequest('POST', '/api/pipelines', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      handleClose();
    },
    onError: (err: any) => {
      setError(err?.message || 'Failed to create pipeline');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Pipeline name is required');
      return;
    }

    try {
      const payload: CreatePipelinePayload = {
        name,
        status,
        description: description.trim() || undefined,
        metadata: metadata.trim() ? JSON.parse(metadata) : undefined
      };
      
      createPipelineMutation.mutate(payload);
    } catch (err) {
      if (metadata.trim()) {
        setError('Invalid JSON format in metadata');
      } else {
        setError('Failed to create pipeline');
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New Pipeline</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Create a new pipeline to group related jobs together.
          </DialogContentText>
          
          {error && (
            <Box sx={{ 
              bgcolor: 'error.light', 
              color: 'error.contrastText', 
              p: 1, 
              borderRadius: 1,
              mb: 2
            }}>
              {error}
            </Box>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Pipeline Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value as PipelineStatus)}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Metadata (JSON format, optional)"
            fullWidth
            variant="outlined"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            multiline
            rows={3}
            placeholder='{"key": "value"}'
            helperText="Enter valid JSON object"
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={createPipelineMutation.isPending}
            startIcon={createPipelineMutation.isPending && <CircularProgress size={16} color="inherit" />}
          >
            {createPipelineMutation.isPending ? 'Creating...' : 'Create Pipeline'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}