import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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

export function JobFilters({ onFilterChange }: JobFiltersProps) {
  const form = useForm<FormValues>({
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
    <Card className="mt-6 mb-8">
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/4">
                  <FormLabel>Job Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="fetchTerrain">Fetch Terrain</SelectItem>
                      <SelectItem value="weatherForecast">Weather Forecast</SelectItem>
                      <SelectItem value="tideForecast">Tide Forecast</SelectItem>
                      <SelectItem value="waveForecast">Wave Forecast</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/4">
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dateFrom"
              render={({ field }) => (
                <FormItem className="w-full md:w-1/4">
                  <FormLabel>Date From</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex items-end w-full md:w-1/4">
              <Button type="submit" className="w-full">
                Apply Filters
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
