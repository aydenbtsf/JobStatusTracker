import { useState } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
} from "@mui/material";
import { useToast } from "@/hooks/use-toast";
import { CreatePipelinePayload } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { PipelineStatus } from "@/schema";

interface MuiPipelineModalProps {
  open: boolean;
  onClose: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  status: z.enum(["active", "archived", "completed"] as const),
  metadata: z.string().optional().transform((val) => {
    if (!val || val.trim() === '') return {};
    try {
      return JSON.parse(val);
    } catch (e) {
      throw new Error("Invalid JSON");
    }
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function MuiPipelineModal({ open, onClose }: MuiPipelineModalProps) {
  console.log("MUI Pipeline Modal rendered, open state:", open);
  const { toast } = useToast();
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active" as const,
      metadata: '{\n  "priority": "medium"\n}',
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    try {
      const payload: CreatePipelinePayload = {
        name: values.name,
        description: values.description,
        status: values.status,
        metadata: values.metadata,
      };
      
      await apiRequest("POST", "/api/pipelines", payload);
      
      toast({
        title: "Pipeline created",
        description: "Your pipeline has been created successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/pipelines'] });
      reset();
      onClose();
    } catch (error) {
      toast({
        title: "Failed to create pipeline",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Create New Pipeline</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a new pipeline to organize related jobs. Fill out the information below.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Pipeline Name"
                  variant="outlined"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
            
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    {...field}
                    labelId="status-select-label"
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                  {errors.status && (
                    <Typography variant="caption" color="error">
                      {errors.status.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
            
            <Controller
              name="metadata"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Metadata (JSON)"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={5}
                  error={!!errors.metadata}
                  helperText={errors.metadata ? String(errors.metadata.message) : "Enter metadata as JSON (optional)"}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Create Pipeline
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
