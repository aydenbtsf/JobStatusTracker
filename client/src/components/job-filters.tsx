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
import { FilterAlt } from "lucide-react";

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
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
          
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              startIcon={<FilterAlt size={16} />}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </form>
    </StyledPaper>
  );
}