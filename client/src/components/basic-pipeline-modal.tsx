import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Typography
} from '@mui/material';
import { PipelineStatus } from '@/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface PipelineModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BasicPipelineModal({ open, onClose }: PipelineModalProps) {
  console.log("BasicPipelineModal rendered, open state:", open);
  
  // Log open state changes
  useEffect(() => {
    console.log("BasicPipelineModal open state changed to:", open);
  }, [open]);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<PipelineStatus>('active');
  const [metadata, setMetadata] = useState('{}');
  
  // Error state
  const [nameError, setNameError] = useState('');
  const [metadataError, setMetadataError] = useState('');
  
  // Reset form function
  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus('active');
    setMetadata('{}');
    setNameError('');
    setMetadataError('');
  };
  
  // Handle close - reset form and close modal
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Form validation
  const validateForm = () => {
    let valid = true;
    
    if (!name.trim()) {
      setNameError('Name is required');
      valid = false;
    } else if (name.trim().length < 3) {
      setNameError('Name must be at least 3 characters');
      valid = false;
    } else {
      setNameError('');
    }
    
    if (metadata) {
      try {
        JSON.parse(metadata);
        setMetadataError('');
      } catch (error) {
        setMetadataError('Invalid JSON format');
        valid = false;
      }
    }
    
    return valid;
  };
  
  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const payload = {
        name,
        description: description || null,
        status,
        metadata: metadata ? JSON.parse(metadata) : null
      };
      
      console.log("Creating pipeline with payload:", payload);
      
      await apiRequest('POST', '/api/pipelines', payload);
      
      // Invalidate pipelines cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines'] });
      
      console.log("Pipeline created successfully!");
      
      // Close modal
      handleClose();
    } catch (error) {
      console.error("Failed to create pipeline:", error);
    }
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Create New Pipeline</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Create a new pipeline to organize jobs and workflows.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!nameError}
            helperText={nameError || "Enter a name for the pipeline"}
            fullWidth
            required
          />
          
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            helperText="Provide a description for this pipeline (optional)"
            fullWidth
            multiline
            rows={3}
          />
          
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as PipelineStatus)}
              label="Status"
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Metadata (JSON)"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            error={!!metadataError}
            helperText={metadataError || "Enter metadata as JSON (optional)"}
            fullWidth
            multiline
            rows={4}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
        >
          Create Pipeline
        </Button>
      </DialogActions>
    </Dialog>
  );
}
