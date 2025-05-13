import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Box,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Typography,
  FormHelperText,
  styled
} from "@mui/material";
import { Filter } from "lucide-react";

interface JobFiltersProps {
  onFilterChange: (filters: {
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => void;
}

const formSchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

export function JobFilters({ onFilterChange }: JobFiltersProps) {
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    onFilterChange(values);
  };

  return (
    <StyledPaper elevation={0} variant="outlined">
      <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
        Filter Jobs
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          <Box>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel id="job-type-label">Job Type</InputLabel>
                  <Select
                    {...field}
                    labelId="job-type-label"
                    label="Job Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="fetchTerrain">Fetch Terrain</MenuItem>
                    <MenuItem value="weatherForecast">Weather Forecast</MenuItem>
                    <MenuItem value="tideForecast">Tide Forecast</MenuItem>
                    <MenuItem value="waveForecast">Wave Forecast</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Box>
          
          <Box>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    {...field}
                    labelId="status-label"
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Box>
          
          <Box>
            <Controller
              name="dateFrom"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label="Date From"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              startIcon={<Filter size={16} />}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </form>
    </StyledPaper>
  );
}