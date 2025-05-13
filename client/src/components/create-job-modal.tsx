import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CreateJobPayload } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { JobType } from "@shared/schema";

interface CreateJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  type: z.enum(["fetchTerrain", "weatherForecast", "tideForecast", "waveForecast"] as const),
  args: z.string().min(2, "Arguments must be valid JSON").transform((val) => {
    try {
      return JSON.parse(val);
    } catch (e) {
      throw new Error("Invalid JSON");
    }
  }),
  triggerIds: z.string().optional().transform((val) => val ? val.split(",").map(id => id.trim()) : []),
});

export function CreateJobModal({ open, onOpenChange }: CreateJobModalProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: undefined,
      args: '{\n  "location": "San Francisco Bay"\n}',
      triggerIds: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload: CreateJobPayload = {
        type: values.type,
        args: values.args,
        triggerIds: values.triggerIds.length > 0 ? values.triggerIds : undefined,
      };
      
      await apiRequest("POST", "/api/jobs", payload);
      
      toast({
        title: "Job created",
        description: "Your job has been created successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Failed to create job",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Please fill out the form below to create a new job.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a job type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fetchTerrain">Fetch Terrain</SelectItem>
                      <SelectItem value="weatherForecast">Weather Forecast</SelectItem>
                      <SelectItem value="tideForecast">Tide Forecast</SelectItem>
                      <SelectItem value="waveForecast">Wave Forecast</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="args"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arguments (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"location": "San Francisco Bay"}'
                      className="font-mono h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="triggerIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Triggers (Job IDs, comma-separated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="job_12345abcde, job_67890fghij"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
