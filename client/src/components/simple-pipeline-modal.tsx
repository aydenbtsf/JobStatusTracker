import { useState } from 'react';
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
  Typography,
  Box
} from '@mui/material';
import { PipelineStatus } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface SimplePipelineModalProps {
  open: boolean;
  onClose: () => void;
}

export function SimplePipelineModal({ open, onClose }: SimplePipelineModalProps) {
  console.log("SimplePipelineModal rendered, open state:", open);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<PipelineStatus>('active');
  const [metadata, setMetadata] = useState('{\n  "priority": "medium"\n}');
  
  // Error state
  const [nameError, setNameError] = useState('');
  const [metadataError, setMetadataError] = useState('');
  
  const validate = () => {
    let isValid = true;
    
    // Validate name
    if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // Validate metadata
    if (metadata.trim()) {
      try {
        JSON.parse(metadata);
        setMetadataError('');
      } catch (e) {
        setMetadataError('Invalid JSON format');
        isValid = false;
      }
    } else {
      setMetadataError('');
    }
    
    return isValid;
  };
  
  const resetForm = () => {
    setName('');
    setDescription('');
    setStatus('active');
    setMetadata('{\n  "priority": "medium"\n}');
    setNameError('');
    setMetadataError('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      const payload = {
        name,
        description: description || undefined,
        status,
        metadata: metadata.trim() ? JSON.parse(metadata) : undefined
      };
      
      await apiRequest("POST", "/api/pipelines", payload);
      
      // Refresh pipelines data
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines'] });
      
      // Success - close modal and reset form
      handleClose();
      
      // Show success message
      console.log("Pipeline created successfully!");
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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create a new pipeline to organize related jobs. Fill out the information below.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <TextField
            label="Pipeline Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            error={!!nameError}
            helperText={nameError}
          />
          
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
          
          <FormControl fullWidth>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
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
            fullWidth
            multiline
            rows={5}
            error={!!metadataError}
            helperText={metadataError || "Enter metadata as JSON (optional)"}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Create Pipeline
        </Button>
      </DialogActions>
    </Dialog>
  );
}